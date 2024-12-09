import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = 'http://localhost:3000/game'; // Agregado '/auth' para claridad en las rutas

  constructor(private http: HttpClient) { }

  /**
   * Realiza una petición al backend en el endpoint '/game' post.
   * @param rounds Número de rondas.
   * @returns Un Observable que emite el resultado del juego, que incluye el gameId.
   */
  public startGame(rounds: number): Observable<{ gameId: string }> {
    const body = { rounds };
    return this.http
      .post<{ gameId: string }>(`${this.apiUrl}`, body, {
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
