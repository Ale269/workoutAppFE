
import {HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent} from "@angular/common/http";
import { inject } from '@angular/core'; // Importa 'inject' per accedere ai servizi
import { Observable } from "rxjs";
import {TokenService} from "../services/token.service"; // Per Observable, HttpEvent (se necessario nel tipo di ritorno)

// Definisci l'interceptor come una funzione
export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    // In un interceptor funzionale, devi usare 'inject' per ottenere i servizi
    const tokenService = inject(TokenService);

    const token = tokenService.getToken();

    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }
    return next(req);
};
