import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // Agregado '/auth' para claridad en las rutas

  constructor(private http: HttpClient) {}

  /**
   * Realiza una solicitud de inicio de sesión.
   * @param email Nombre de usuario.
   * @param password Contraseña del usuario.
   * @returns Un Observable que emite el token de autenticación.
   */
  login(email: string, password: string): Observable<{token: string }> {
    const body = { email, password };
    return this.http
      .post<{token: string}>(`${this.apiUrl}/login`, body, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Realiza una solicitud de registro.
   * @param username Nombre de usuario.
   * @param password Contraseña del usuario.
   * @param email Email del usuario.
   * @returns Un Observable que emite el token de autenticación.
   */
  register(
    username: string,
    password: string,
    email: string
  ): Observable<{ token: string }> {
    const body = { username, password, email };
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/register`, body)
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
