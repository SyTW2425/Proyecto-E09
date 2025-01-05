import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private apiUrl = environment.apiUrl + '/api';

	constructor(private http: HttpClient) {}

  /**
   * Obtiene el nombre de usuario actual.
   * @returns Un Observable que emite el nombre de usuario.
   */
	a(data: { username: string | null; email: string | null; id: string | null }): Observable<{ username: string; email: string; password: string; token: string, level: number, experience: number }> {
    const params = {
        ...(data.username && { username: data.username }),
        ...(data.email && { email: data.email }),
        ...(data.id && { password: data.id }),
    };

    return this.http
        .get<{ username: string; email: string; password: string; token: string, level: number, experience: number }>(`${this.apiUrl}/user`, { params })
        .pipe(catchError(this.handleError));
}

// get user with query instead of params /:username
getUser(username: string): Observable<{ username: string; email: string; password: string; token: string, level: number, experience: number }> {
		return this.http
				.get<{ username: string; email: string; password: string; token: string, level: number, experience: number }>(`${this.apiUrl}/user/${username}`)
				.pipe(catchError(this.handleError));
	}

	

	/**
	 * Manejo de errores centralizado.
	 * @param error Objeto de error recibido.
	 * @returns Un Observable que emite un error transformado.
	 */
	private handleError(error: HttpErrorResponse): Observable<never> {
		let errorMessage = 'An unknown error occurred!';
		if (error.error instanceof ErrorEvent) {
			// Error del cliente
			errorMessage = `Client error: ${error.error.message}`;
		} else {
			// Error del servidor
			errorMessage = `Server error: ${error.status}, message: ${error.message}`;
		}
		console.error(errorMessage);
		return throwError(() => new Error(errorMessage));
	}
}
