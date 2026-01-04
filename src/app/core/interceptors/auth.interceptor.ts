
import {HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse} from "@angular/common/http";
import { inject } from '@angular/core';
import { Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import {AuthService} from "../services/auth.service";

// Definisci l'interceptor come una funzione
export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    // In un interceptor funzionale, devi usare 'inject' per ottenere i servizi
    const authService = inject(AuthService);
    let token: string | null = authService.getToken();

    // Clona la richiesta e aggiungi il token se presente
    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Gestisci la risposta e intercetta gli errori 401
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Verifica se la chiamata è relativa all'autenticazione
                // In questi casi NON fare refresh/logout perché è normale ricevere 401
                const isAuthenticationEndpoint = req.url.includes('/login') ||
                                                  req.url.includes('/register') ||
                                                  req.url.includes('/signup') ||
                                                  req.url.includes('/refresh');

                if (!isAuthenticationEndpoint) {
                    // Token scaduto - prova a fare refresh
                    return authService.refreshAccessToken().pipe(
                        switchMap((refreshResponse) => {
                            // Refresh riuscito - riprova la richiesta originale con il nuovo token
                            const retryReq = req.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${refreshResponse.jwtToken}`
                                }
                            });
                            return next(retryReq);
                        }),
                        catchError((refreshError) => {
                            // Refresh fallito - effettua logout
                            authService.logout();
                            return throwError(() => refreshError);
                        })
                    );
                }
            }
            // Rilancia l'errore per permettere ad altri handler di gestirlo
            return throwError(() => error);
        })
    );
};
