import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = environment.apiUrl + '/game';
  private gameData: any;
  constructor(private http: HttpClient) { }

  /**
   * Realiza una petición al backend en el endpoint '/game' post.
   * @param rounds Número de rondas.
   * @returns Un Observable que emite el resultado del juego, que incluye el gameId.
   */
  public startGame(rounds: number, b_year?: number, f_year?: number): Observable<{ gameId: string, rounds: number }> {
    const body = { rounds, b_year, f_year };
    return this.http
      .post<{ gameId: string, rounds: number }>(`${this.apiUrl}`, body, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  getAnimeSuggestions(): Observable<string[]> {
	  return this.http.get('anime_names.txt', { responseType: 'text' }).pipe(
		map((data) => data.split('\n').map((anime) => anime.trim()))
	  );
	}


  setGameData(data: any) {
    this.gameData = data;
  }

  getGameData() {
    return this.gameData;
  }

  public getRoundData(gameId: string, rounds: number):
    Observable<{
      rounds: number;
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
        rounds: number;
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
    return this.http
      .patch<{ correct: boolean }>(`${this.apiUrl}/answer`, body, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  public askForGameDelete(gameId: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${gameId}`, {
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