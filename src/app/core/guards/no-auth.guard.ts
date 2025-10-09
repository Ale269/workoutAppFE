
import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from '../services/auth.service';


@Injectable({
    providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    /**
     * Protegge le pagine per cui è previsto che non si abbia un utente loggato, e le rimandiamo alla home
     */
    canActivate(): Observable<boolean> {
        return this.authService.authState$.pipe(
            map(authState => {
                if (!authState.isAuthenticated) {
                    return true;
                } else {
                    this.router.navigate(['/home']);
                    return false;
                }
            })
        );
    }
}
