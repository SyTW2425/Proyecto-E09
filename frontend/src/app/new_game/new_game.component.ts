import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoloGamePopupComponent } from '../solo_game_popup/solo-game-popup.component';
import { MatIconModule } from '@angular/material/icon';  // Import MatIconModule
import { GameService } from '../game.service';

@Component({
  selector: 'app-new_game',
  templateUrl: './new_game.component.html',
  styleUrls: ['./new_game.component.css'],
  imports: [CommonModule, MatIconModule, SoloGamePopupComponent],  // Add MatIconModule here
  standalone: true
})
export class NewGameComponent implements OnInit {
  userName!: string;

  constructor(private gameService: GameService) {}

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
          console.log('Game started:', data);
        },
        (error) => {
          console.error('Error starting game:', error);
        }
      );
    }
  }
}
