import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {GameService} from '../game.service';

@Component({
  selector: 'app-solo-game-popup',
  templateUrl: './solo-game-popup.component.html',
  styleUrls: ['./solo-game-popup.component.css'],
	imports: [FormsModule],
  standalone: true,
})
export class SoloGamePopupComponent {
  @Input() categories: string[] = [];
  @Output() gameConfigured = new EventEmitter<{ rounds: number; b_year?: number; f_year?: number }>();
  rounds: number = 1;
  b_year?: number; // Beginning year Optional
  f_year?: number; // Final year Optional

  constructor(private gameService: GameService) {}

  closePopup() {
    this.gameConfigured.emit({ rounds: 0 });
  }

  startGame() {
    if (this.rounds > 100) {
      alert('You can\'t play more than 100 rounds');
      return;
    }
    if (this.b_year && this.f_year && this.b_year > this.f_year) {
      alert('The beginning year must be less than the final year');
      return;
    }
    this.gameConfigured.emit({ rounds: this.rounds, b_year: this.b_year, f_year: this.f_year });
  }
}
