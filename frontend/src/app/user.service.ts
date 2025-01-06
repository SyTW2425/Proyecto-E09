import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private apiUrl = environment.apiUrl + '/api';

	constructor(private http: HttpClient) { }

	// get user with query instead of params /:username
	getUser(username: string): Observable<{ username: string; email: string; password: string; token: string, level: number, experience: number }> {
		const headers = new HttpHeaders().set('x-access-token', document.cookie.split('=')[1]);
		return this.http
			.get<{ username: string; email: string; password: string; 
						 token: string, level: number, experience: number }>
			(`${this.apiUrl}/user/${username}`, { headers })
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
