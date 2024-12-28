import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoloGamePopupComponent } from '../solo_game_popup/solo-game-popup.component';
import { MatIconModule } from '@angular/material/icon'; 
import { GameService } from '../game.service';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-new_game',
  templateUrl: './new_game.component.html',
  styleUrls: ['./new_game.component.css'],
  imports: [CommonModule, MatIconModule, SoloGamePopupComponent, RouterModule], 
  standalone: true
})
export class NewGameComponent implements OnInit {
  userName!: string;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userName = localStorage.getItem('username') || 'John Doe';
  }

  isPopupVisible = false;

  showPopup() {
    this.isPopupVisible = true;
  }

  handlePopupResult(result: { rounds: number; } | null) {
    this.isPopupVisible = false;
    if (result) {
      if (result.rounds === 0) {
        console.log('Game canceled');
        return;
      }
      // StartGame from GameService
      this.gameService.startGame(result.rounds).subscribe(
        (data) => {
          this.gameService.setGameData(data);
          this.router.navigate(['/gamepage', data.gameId]);
        },
        (error) => {
          console.error('Error starting game:', error);
        }
      );
    }
  }
}
