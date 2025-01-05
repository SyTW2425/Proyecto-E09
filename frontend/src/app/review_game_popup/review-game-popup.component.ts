import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from '../game.service';

@Component({
  selector: 'app-review-game-popup',
  templateUrl: './review-game-popup.component.html',
  styleUrls: ['./review-game-popup.component.css'],
	imports: [RouterModule, MatIconModule, CommonModule],
  standalone: true,
})
export class ReviewGamePopupComponent {
  public roundsData: { roundNumber: number; anime: string; correct: boolean }[] = [];

  constructor(private router: Router, private gameService: GameService) {
    if (localStorage.getItem('roundsData'))
      this.roundsData = JSON.parse(localStorage.getItem('roundsData') || '');
  }

  goToNewGame() {
    this.gameService.askForGameDelete(localStorage.getItem('gameId')!);
    this.router.navigate(['/new_game']);
  }
}
