import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(): Observable<boolean> {
        // Verifica solo che l'utente abbia il ruolo ADMIN
        // L'autenticazione è già verificata da AuthGuard (usato in fila)
        const currentUser = this.authService.getCurrentUser();

        if (currentUser?.role !== 'ADMIN') {
            console.log('Accesso negato: utente non ADMIN');
            this.router.navigate(['/home']);
            return of(false);
        }

        return of(true);
    }
}
