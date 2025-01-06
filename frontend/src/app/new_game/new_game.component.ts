import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoloGamePopupComponent } from '../solo_game_popup/solo-game-popup.component';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '../game.service';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../user.service';


@Component({
  selector: 'app-new_game',
  templateUrl: './new_game.component.html',
  styleUrls: ['./new_game.component.css'],
  imports: [CommonModule, MatIconModule, SoloGamePopupComponent, RouterModule],
  standalone: true
})
export class NewGameComponent implements OnInit {
  userName!: string;
  level: number = 1;
  experience: number = 0;

  constructor(
    private gameService: GameService,
    private router: Router,
    private userService: UserService,
  ) { }

  ngOnInit() {
    if (!document.cookie.includes('token') || document.cookie.toString() === 'token=;') {
      this.router.navigate(['/login']);
    }
    this.experience = 400;
    this.userName = localStorage.getItem('username') || 'John Doe';
    this.userService.getUser(this.userName).subscribe(
      (data) => {
        this.level = data.level;
        this.experience = data.experience;
      },
      (error) => {
        console.error('Error getting user:', error);
      }
    );

  }

  isPopupVisible = false;

  showPopup() {
    this.isPopupVisible = true;
  }

  public logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    this.router.navigate(['/login']);
  }

  handlePopupResult(result: { rounds: number; b_year?: number; f_year?: number } | null) {
    this.isPopupVisible = false;
    if (result) {
      if (result.rounds === 0) return;
      if (localStorage.getItem('roundsData'))
        localStorage.removeItem('roundsData');
      this.gameService.startGame(result.rounds, result.b_year, result.f_year).subscribe(
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

  startQuickGame() {
    this.handlePopupResult({ rounds: 10 });
  }
}
