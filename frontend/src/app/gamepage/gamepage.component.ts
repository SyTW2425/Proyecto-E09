import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { GameService } from '../game.service';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
	selector: 'gamepage',
	templateUrl: './gamepage.component.html',
	styleUrls: ['./gamepage.component.css'],
	imports: [ReactiveFormsModule, MatIconModule, CommonModule, RouterModule],
	standalone: true,
})
export class GamepageComponent {
	@Input() categories: string[] = [];
	gameId!: string;
	rounds: number = 1;
	roundsData: { roundNumber: number; anime: string; correct: boolean }[] = [];
	videoUrl: SafeResourceUrl = '';
	songName: string = '';
	songUrl: string = '';
	images: SafeResourceUrl[] = [];
	timeStart: number = Math.floor(Math.random() * (70 - 15 + 1) + 15);
	videoElement!: HTMLVideoElement; // Referencia al elemento de video
	animeForm: FormGroup;
	currentRound: number = 1;

	constructor(private route: ActivatedRoute,
		private gameService: GameService,
		private sanitizer: DomSanitizer,
		private formBuilder: FormBuilder,
		private router: Router
	) {
		this.route.paramMap.subscribe((params) => {
			this.gameId = params.get('gameId') || '';
			this.rounds = gameService.getGameData().rounds;
			console.log('GamepageComponent params:', this.rounds);
			this.roundsData = this.llenarRoundsData(this.rounds, this.roundsData);
		});

		this.gameService.getRoundData(this.gameId, this.rounds).subscribe(
			(data) => {
				this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.anime.video + '#t=' + this.timeStart);
				this.songName = data.anime.songName;
				this.songUrl = data.anime.songUrl;
				this.images = data.anime.images.map((url) => this.sanitizer.bypassSecurityTrustResourceUrl(url));
				this.currentRound = data.currentRound;
			},
			(error) => {
				console.error('Error getting rounds:', error);
			}
		);

		this.animeForm = this.formBuilder.group({
			anime: [''],
		});
	}

	ngAfterViewInit() {
		// Asignar referencia al elemento de video
		this.videoElement = document.getElementById('my_video') as HTMLVideoElement;

		if (this.videoElement) {
			// Escuchar el evento 'play' para que se ejecute cuando el video empiece a reproducirse
			this.videoElement.addEventListener('play', () => {
				// Detener el video después de 5 segundos
				setTimeout(() => {
					this.stopVideo();
				}, 5000); // Cambia el valor según el tiempo que necesites
			});
		}
	}

	stopVideo() {
		if (this.videoElement) {
			this.videoElement.pause();
			this.videoElement.addEventListener('play', (event) => {
				this.videoElement.pause();
			});
		}
	}

	onSubmit() {
		console.log('Anime:', this.animeForm.value.anime);
		const { anime } = this.animeForm.value;
		this.gameService.sendAnswer(this.gameId, anime).subscribe(
			(data) => {
				console.log('Answer:', data.correct);
				this.roundsData[this.currentRound - 1].anime = anime;
				this.roundsData[this.currentRound - 1].correct = data.correct;
				if (this.currentRound < this.rounds)
					this.router.navigate(['/gamepage', this.gameId]);
			},
			(error) => {
				console.error('Error sending answer:', error);
			})
	}


	public llenarRoundsData(rounds: number, roundsData: { roundNumber: number; anime: string; correct: boolean }[]) {
		roundsData = Array.from({ length: rounds }, (_, i) => ({ roundNumber: i + 1, anime: '-', correct: false }));
		return roundsData;
	}
}
