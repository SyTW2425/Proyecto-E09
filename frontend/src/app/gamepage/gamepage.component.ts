import { Component, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { GameService } from '../game.service';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReviewGamePopupComponent } from '../review_game_popup/review-game-popup.component';
import { animeNames } from '../anime_names';

@Component({
	selector: 'gamepage',
	templateUrl: './gamepage.component.html',
	styleUrls: ['./gamepage.component.css'],
	imports: [ReactiveFormsModule, MatIconModule, MatAutocompleteModule, MatInputModule, CommonModule, RouterModule, ReviewGamePopupComponent],
	standalone: true,
})
export class GamepageComponent {
	gameId!: string;
	rounds: number = 1;
	currentRound: number = 1;
	roundsData: { roundNumber: number; anime: string; correct: boolean }[] = [];
	anime: string = '';
	animeName: string = '';
	videoUrl: SafeResourceUrl = '';
	images: SafeResourceUrl[] = [];
	timeStart: number = Math.floor(Math.random() * (70 - 15 + 1) + 15);
	videoElement!: HTMLVideoElement | null;
	countdown!: HTMLElement;
	animeForm: FormGroup;
	filteredSuggestions: string[] = []; // Anime suggestions for autocomplete
	roundButtonLabel: string = 'Next Round';
	roundEnded: boolean = false;
	showEndGamePopup: boolean = false;
	started: boolean = false;
	correct: boolean = false;
	videoLoaded: boolean = false;
	isSubmitting: boolean = false; // Flag to disable the submit button while the answer is being sent
	timer: NodeJS.Timeout | null = null;
	loading: boolean = false;

	constructor(private route: ActivatedRoute,
		private gameService: GameService,
		private sanitizer: DomSanitizer,
		private formBuilder: FormBuilder,
		private router: Router
	) {
		this.route.paramMap.subscribe((params) => { this.gameId = params.get('gameId')!; });
		this.animeForm = this.formBuilder.group({ anime: [''] });
		this.animeForm.disable();
	}

	ngOnInit() {
		if (!document.cookie.includes('token') || document.cookie.toString() === 'token=;') {
			this.router.navigate(['/login']);
		}
	}

	ngAfterViewInit() {
		this.countdown = document.getElementById('countdown')!;
		this.videoElement = document.getElementById('my_video') as HTMLVideoElement;
		const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
		this.pauseTimer();
		let volume = localStorage.getItem('volume');
		if (volume) {
			this.videoElement!.volume = parseFloat(volume);
			volumeSlider.value = volume;
		}
		volumeSlider.addEventListener('input', (event) => {
			const volume = parseFloat(volumeSlider.value);
			this.videoElement!.volume = volume;
			localStorage.setItem('volume', String(volume));
		});
		volumeSlider.value = String(this.videoElement.volume);
		this.startRound();
	}

	private startRound() {
		this.animeForm.reset();
		this.animeName = '';
		this.videoLoaded = false;
		this.started = false;
		this.roundEnded = false;
		this.filteredSuggestions = [];
		this.gameService.getRoundData(this.gameId, this.rounds).subscribe(
			(data) => {
				this.rounds = data.rounds;
				this.currentRound = data.currentRound;
				if (localStorage.getItem('roundsData'))
					this.roundsData = JSON.parse(localStorage.getItem('roundsData') || '');
				this.anime = data.anime.name;
				this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.anime.video + '#t=' + this.timeStart);
				this.images = data.anime.images.map((url) => this.sanitizer.bypassSecurityTrustResourceUrl(url));
				this.images.sort((a, b) => {
					if (a.toString().includes('large')) return -1;
					if (b.toString().includes('large')) return 1;
					return 0;
				});
			},
			(error) => { console.error('Error this round data:', error); }
		);
		if (!this.videoElement) this.videoElement = document.getElementById('my_video') as HTMLVideoElement;
		if (!this.countdown) this.countdown = document.getElementById('countdown') as HTMLElement;
		this.pauseTimer();
		this.videoElement.addEventListener('canplaythrough', () => { this.videoLoaded = true; });
		this.videoElement.addEventListener('waiting', () => { this.loading = true; });
		this.videoElement.addEventListener('playing', () => { this.loading = false; });
		if (this.videoElement.duration - this.timeStart < 15)
			this.timeStart = this.videoElement.duration - 15;
	}

	playPause() {
		this.started = true;
		this.animeForm.enable();
		this.videoElement!.play();
		this.startTimer();
		this.timer = setTimeout(() => {
			if (!this.roundEnded) {
				this.videoElement!.pause();
				if (this.timer) clearTimeout(this.timer);
			}
		}, 15000);
	}

	startTimer(): void {
		this.countdown.classList.remove('countdown-stop');
		this.countdown.classList.add('countdown');
	}

	pauseTimer(): void {
		if (this.countdown) {
			this.countdown.classList.remove('countdown');
			this.countdown.classList.add('countdown-stop');
		}
	}

	public filterAnimes(event: Event): void {
		const inputValue = (event.target as HTMLInputElement).value.toLocaleLowerCase();
		if (inputValue.length > 2) {
			this.filteredSuggestions = animeNames.filter((anime) =>
				anime.toLowerCase().trim().replace(/\s+/g, '').includes(inputValue.trim().replace(/\s+/g, ''))
			);
		} else this.filteredSuggestions = [];
	}

	onSuggestionSelected(suggestion: string): void {
		this.animeForm.get('anime')?.setValue(suggestion);
	}

	onSubmit() {
		const { anime } = this.animeForm.value;
		if (this.isSubmitting || anime === '' || !anime) return;
		this.isSubmitting = true; // Disable the submit button
		this.animeForm.disable();
		this.pauseTimer();
		if (this.timer) clearTimeout(this.timer);
		let username;
		if (this.currentRound === this.rounds) {
			this.roundButtonLabel = 'Review Game';
			username = localStorage.getItem('username');
		}
		this.gameService.sendAnswer(this.gameId, anime, username).subscribe(
			(data) => {
				this.roundsData.push({ roundNumber: this.currentRound, anime: this.anime, correct: data.correct });
				this.animeName = this.anime;
				this.correct = data.correct;
				localStorage.setItem('roundsData', JSON.stringify(this.roundsData));
				this.roundEnded = true;
				this.videoElement!.currentTime = this.timeStart;
				this.videoElement!.play();
				this.isSubmitting = false; // Enable the submit button
			},
			(error) => {
				console.error('Error sending answer:', error);
				this.isSubmitting = false; // Enable the submit button
			})
	}

	nextRound() {
		this.videoElement!.pause();
		this.currentRound === this.rounds ? this.showEndGamePopup = true : this.startRound();
	}

	deleteGame() {
		this.gameService.askForGameDelete(this.gameId);
	}
}