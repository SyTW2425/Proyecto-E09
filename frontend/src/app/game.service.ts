import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = 'http://localhost:3000/game';
  private gameData: any;
  constructor(private http: HttpClient) { }

  /**
   * Realiza una petición al backend en el endpoint '/game' post.
   * @param rounds Número de rondas.
   * @returns Un Observable que emite el resultado del juego, que incluye el gameId.
   */
  public startGame(rounds: number): Observable<{ gameId: string, rounds: number }> {
    const body = { rounds };
    return this.http
      .post<{ gameId: string, rounds: number }>(`${this.apiUrl}`, body, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }


  setGameData(data: any) {
    this.gameData = data;
  }

  getGameData() {
    return this.gameData;
  }

  public getRoundData(gameId: string, rounds: number):
    Observable<{
      currentRound: number;
      score: number;
      anime: {
        name: string;
        images: string[];
        songName: string;
        video: string;
        songUrl: string;
      };
    }> {
    return this.http
      .get<{
        currentRound: number;
        score: number;
        anime: {
          name: string;
          images: string[];
          songName: string;
          video: string;
          songUrl: string;
        };
      }>(`${this.apiUrl}/${gameId}`, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }


  public sendAnswer(gameId: string, userAnswer: string): Observable<{ correct: boolean }> {
    const body = { gameId, userAnswer };
    console.log('Sending answer:', body);
    return this.http
      .patch<{ correct: boolean }>(`${this.apiUrl}/answer`, body, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error: ${error.error}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}