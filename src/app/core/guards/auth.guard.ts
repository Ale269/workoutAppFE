
import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import {Observable, of} from "rxjs";
import { map, filter, take, switchMap } from "rxjs/operators";
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(): Observable<boolean> {
        // Aspetta che l'autenticazione sia inizializzata (incluso refresh token se necessario)
        return this.authService.authInitialized$.pipe(
            filter(initialized => initialized === true),
            take(1),
            switchMap(() => {
                console.log("LOG AUTHGUARD: ", this.authService.isAuthenticated());
                if (this.authService.isAuthenticated()) {
                    return of(true);
                } else {
                    this.authService.logout();
                    return of(false);
                }
            })
        );
    }
}
