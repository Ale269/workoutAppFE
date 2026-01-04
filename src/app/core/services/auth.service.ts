
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { Router } from '@angular/router';
import {ApiCatalogService} from "./api-catalog.service";
import { LoginRequestModel, LoginResponseModel } from 'src/app/models/auth/login-model';
import { SignupRequestModel, SignupResponseModel } from 'src/app/models/auth/signup-model';
import { RefreshTokenRequestModel, RefreshTokenResponseModel } from 'src/app/models/auth/refresh-token-model';
import {AuthStateModel} from "../../models/user/auth-state-model";
import {UserModel} from "../../models/user/user-model";
import {ErrorHandlerService} from "./error-handler.service";
import {SpinnerService} from "./spinner.service";
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {


    private authStateSubject = new BehaviorSubject<AuthStateModel>({
         isAuthenticated: false,
         user: null,
         token: null
     });

    private currentSpinnerId: string | null = null;
    private refreshTokenTimeout: any = null;
    public authState$ = this.authStateSubject.asObservable();

    constructor(
        private router: Router,
        private apiCatalogService: ApiCatalogService,
        private errorHandlerService: ErrorHandlerService,
        private spinnerService: SpinnerService,) {
        //bisogna fare chiamata api per recuperare user e allora siamo apposto
        this.loadAuthState();
    }

    signup(credentials: SignupRequestModel): Observable<SignupResponseModel> {
        return this.apiCatalogService.executeApiCall('auth','register', undefined, credentials);
    }

    login(credentials: LoginRequestModel): Observable<LoginResponseModel> {
        return this.apiCatalogService.executeApiCall('auth','login', undefined, credentials);
    }

    logout(): void {
         this.clearAuthState();
         this.router.navigate(['/login']);
    }

    checkUserAuthentication(): Observable<any> {
        return this.apiCatalogService.executeApiCall('auth','checkUserAuthentication', undefined, undefined);
    }

    setAuthState(user: UserModel, token: string, refreshToken: string): void {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

         this.authStateSubject.next({
             isAuthenticated: true,
             user: user,
             token: token
         });

         // Schedule auto-refresh 5 minuti prima della scadenza del token
         this.scheduleTokenRefresh(token);
    }

    private clearAuthState(): void {
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         localStorage.removeItem('refreshToken');

         // Cancella il timeout del refresh automatico
         if (this.refreshTokenTimeout) {
             clearTimeout(this.refreshTokenTimeout);
             this.refreshTokenTimeout = null;
         }

         this.authStateSubject.next({
             isAuthenticated: false,
             user: null,
             token: null
         });
    }

    private loadAuthState(): void {
         const token = localStorage.getItem('token');
         const userStr = localStorage.getItem('user');

         if (token && userStr) {
             try {
                 const user = JSON.parse(userStr);
                 this.authStateSubject.next({
                     isAuthenticated: true,
                     user: user,
                     token: token
                 });

                 // Schedule auto-refresh anche al caricamento dell'app
                 this.scheduleTokenRefresh(token);
             } catch (error) {
                 this.clearAuthState();
             }
         }
    }

    isAuthenticated(): boolean {
         return this.getCurrentUser() != null && this.getToken() != null;
    }

    getCurrentUser(): UserModel | null {
         return this.authStateSubject.value.user;
    }

    getToken(): string | null {
         return this.authStateSubject.value.token;
    }

    getRefreshToken(): string | null {
         return localStorage.getItem('refreshToken');
    }

    refreshAccessToken(): Observable<RefreshTokenResponseModel> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const request: RefreshTokenRequestModel = { refreshToken };

        return (this.apiCatalogService.executeApiCall('auth', 'refresh', undefined, request) as Observable<RefreshTokenResponseModel>).pipe(
            tap((response: RefreshTokenResponseModel) => {
                // Aggiorna lo stato con il nuovo access token
                // Il refresh token rimane lo stesso (no rotation)
                const currentUser = this.getCurrentUser();
                if (currentUser) {
                    this.authStateSubject.next({
                        isAuthenticated: true,
                        user: {
                            ...currentUser,
                            role: response.role,
                            email: response.email,
                            name: response.name,
                            surname: response.surname
                        },
                        token: response.jwtToken
                    });
                    localStorage.setItem('token', response.jwtToken);

                    // Re-schedule auto-refresh con il nuovo token
                    this.scheduleTokenRefresh(response.jwtToken);
                }
            })
        );
    }

    private scheduleTokenRefresh(token: string): void {
        // Cancella eventuali timeout precedenti
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }

        try {
            // Decodifica il JWT per ottenere la scadenza
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresAt = payload.exp * 1000; // Converti in millisecondi
            const now = Date.now();

            // Calcola quando fare il refresh (5 minuti prima della scadenza)
            const refreshAt = expiresAt - (5 * 60 * 1000); // 5 minuti prima
            const timeUntilRefresh = refreshAt - now;

            // Se il tempo è positivo, schedula il refresh
            if (timeUntilRefresh > 0) {
                this.refreshTokenTimeout = setTimeout(() => {
                    this.refreshAccessToken().subscribe({
                        error: (error) => {
                            // Se il refresh fallisce, effettua logout
                            console.error('Auto-refresh failed:', error);
                            this.logout();
                        }
                    });
                }, timeUntilRefresh);
            }
        } catch (error) {
            console.error('Error scheduling token refresh:', error);
        }
    }
}
