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

@Component({
	selector: 'gamepage',
	templateUrl: './gamepage.component.html',
	styleUrls: ['./gamepage.component.css'],
	imports: [ReactiveFormsModule, MatIconModule, MatAutocompleteModule, MatInputModule, CommonModule, RouterModule, ReviewGamePopupComponent],
	standalone: true,
})
export class GamepageComponent {
	@Input() categories: string[] = [];
	gameId!: string;
	rounds: number = 1;
	roundsData: { roundNumber: number; anime: string; correct: boolean }[] = [];
	videoUrl: SafeResourceUrl = '';
	anime: string = '';
	animeName: string = '';
	images: SafeResourceUrl[] = [];
	timeStart: number = Math.floor(Math.random() * (70 - 15 + 1) + 15);
	videoElement!: HTMLVideoElement; // Referencia al elemento de video
	animeForm: FormGroup;
	currentRound: number = 1;
	cover: boolean = true;
	roundEnded: boolean = false;
	endGame: boolean = false;
	started: boolean = false;
	currentTime: number = 0;
	filteredSuggestions: string[] = []; // Anime suggestions for autocomplete
	allAnimes: string[] = [];  // Anime list for autocomplete
	roundButtonLabel: string = 'Next Round';
	showEndGamePopup: boolean = false;
	correct: boolean = false;

	private startRound() {
		this.started = false;
		this.cover = true;
		this.roundEnded = false;
		this.gameService.getRoundData(this.gameId, this.rounds).subscribe(
			(data) => {
				this.rounds = data.rounds;
				if (localStorage.getItem('roundsData'))
					this.roundsData = JSON.parse(localStorage.getItem('roundsData') || '');
				this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.anime.video + '#t=' + this.timeStart);
				this.anime = data.anime.name;
				this.images = data.anime.images.map((url) => this.sanitizer.bypassSecurityTrustResourceUrl(url));
				this.images.sort((a, b) => {
					if (a.toString().includes('large')) return -1;
					if (b.toString().includes('large')) return 1;
					return 0;
				});
				this.currentRound = data.currentRound;
			},
			(error) => {
				console.error('Error getting rounds:', error);
			}
		);

		if (!this.videoElement) {
			this.videoElement = document.getElementById('my_video') as HTMLVideoElement;
		}
		if (this.videoElement.duration - this.timeStart < 15) {
			this.timeStart = this.videoElement.duration - 10;
		}
		this.videoElement.addEventListener('play', () => {
			// Detener el video después de 5 segundos
			if (!this.roundEnded)
				setTimeout(() => {
					this.stopVideo();
				}, 15000); // Cambia el valor según el tiempo que necesites
		});
	}

	playPause() {
		this.started = true;
		this.animeForm.enable();
		if (this.videoElement.paused) {
			this.videoElement.play();
			this.currentTime = this.videoElement.currentTime;
		}
	}

	constructor(private route: ActivatedRoute,
		private gameService: GameService,
		private sanitizer: DomSanitizer,
		private formBuilder: FormBuilder,
		private router: Router
	) {
		this.route.paramMap.subscribe((params) => {
			this.gameId = params.get('gameId') || '';
		}, () => {
			console.error('Error getting gameId');
		}
		);

		this.animeForm = this.formBuilder.group({
			anime: [''],
		});

		this.animeForm.disable();
		this.gameService.getAnimeSuggestions().subscribe(
			(data) => {
				this.allAnimes = data; // data es un array de strings
			},
			(error) => {
				console.error('Error loading anime suggestions:', error);
			}
		);
	}

	public filterAnimes(event: Event): void {
		const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
		if (inputValue.length > 2) {
			this.filteredSuggestions = this.allAnimes.filter((anime) =>
				anime.toLowerCase().trim().replace(/\s+/g, '').includes(inputValue.toLocaleLowerCase().trim().replace(/\s+/g, ''))
			);
		}
		if (inputValue.length <= 2) {
			this.filteredSuggestions = [];
		}
	}

	onSuggestionSelected(suggestion: string): void {
		this.animeForm.get('anime')?.setValue(suggestion); // Fill the input with the selected suggestion
	}

	ngOnInit() {
		if (!document.cookie.includes('token') || document.cookie.toString() === 'token=;') {
			this.router.navigate(['/login']);
		}
		this.gameService.getAnimeSuggestions().subscribe((animes: string[]) => {
			this.allAnimes = animes;
		});
	}

	ngAfterViewInit() {
		this.videoElement = document.getElementById('my_video') as HTMLVideoElement;
		this.startRound();
	}

	stopVideo() {
		let cRound = this.currentRound;
		if (this.videoElement) {
			this.videoElement.pause();
			this.videoElement.addEventListener('play', (event) => {
				if (!this.roundEnded && cRound === this.currentRound) {
					this.videoElement.pause();
				} else {
					this.videoElement.play();
				}
			});
		}
	}

	public showAnswer(correct: boolean) {
		this.cover = false;
		this.roundEnded = true;
		this.videoElement.currentTime = this.timeStart;
		this.videoElement.play();
		this.videoElement.controls = true;
	}

	onSubmit() {
		const { anime } = this.animeForm.value;
		this.animeForm.disable();
		this.gameService.sendAnswer(this.gameId, anime).subscribe(
			(data) => {
				this.roundsData = this.llenarRoundsData(this.roundsData, this.anime, data.correct);
				this.animeName = this.anime;
				this.correct = data.correct;
				if (this.currentRound === this.rounds) {
					this.roundButtonLabel = 'Review Game';
					this.endGame = true;
					localStorage.setItem('roundsData', JSON.stringify(this.roundsData));
				}
				this.showAnswer(data.correct);
			},
			(error) => {
				console.error('Error sending answer:', error);
			})
	}

	nextRound() {
		this.animeForm.reset();
		this.animeName = '';
		localStorage.setItem('roundsData', JSON.stringify(this.roundsData));
		localStorage.setItem('gameId', this.gameId);
		if (this.endGame)
			this.showEndGamePopup = true;
		else
			this.startRound();
	}

	public llenarRoundsData(
		roundsData: {
			roundNumber: number;
			anime: string;
			correct: boolean
		}[],
		newAnime: string,
		newCorrect: boolean) {
		roundsData.push({
			roundNumber: roundsData.length + 1,
			anime: newAnime,
			correct: newCorrect
		});
		return roundsData;
	}
}