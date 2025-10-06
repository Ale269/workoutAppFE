
import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import {Observable, of} from "rxjs";
import { map } from "rxjs/operators";
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
        console.log("LOG AUTHGUARD: ", this.authService.isAuthenticated());
        if (this.authService.isAuthenticated()) {
            return of(true);
        }else{
            this.authService.logout();
            return of(false);
        }
    }
}
