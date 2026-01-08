
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of, filter, take, firstValueFrom} from 'rxjs';
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

    private authInitializedSubject = new BehaviorSubject<boolean>(false);
    private currentSpinnerId: string | null = null;
    private refreshTokenTimeout: any = null;
    public authState$ = this.authStateSubject.asObservable();
    public authInitialized$ = this.authInitializedSubject.asObservable();

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

                 // Aspetta che API Catalog sia disponibile prima di schedulare il refresh
                 this.apiCatalogService.apiCatalog$.pipe(
                     filter(catalog => catalog !== null),
                     take(1)
                 ).subscribe(() => {
                     this.scheduleTokenRefresh(token);
                 });
             } catch (error) {
                 this.clearAuthState();
                 this.authInitializedSubject.next(true);
             }
         } else {
             // Nessun token presente, inizializzazione completata immediatamente
             this.authInitializedSubject.next(true);
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

    async verifyAndRefreshToken(): Promise<void> {
        const token = this.getToken();
        const refreshToken = this.getRefreshToken();

        // Se non c'è token, non c'è nulla da verificare
        if (!token || !refreshToken) {
            return;
        }

        try {
            // Decodifica il token per controllare la scadenza
            const parts = token.split('.');
            if (parts.length !== 3) {
                // Token malformato, prova a refreshare
                await firstValueFrom(this.refreshAccessToken());
                return;
            }

            const payload = JSON.parse(atob(parts[1]));
            const expiresAt = payload.exp * 1000;
            const now = Date.now();

            // Se il token è scaduto o sta per scadere (entro 5 minuti), refresha
            if (now >= expiresAt - (5 * 60 * 1000)) {
                await firstValueFrom(this.refreshAccessToken());
            }
        } catch (error) {
            // Se qualcosa va storto, prova a refreshare
            try {
                await firstValueFrom(this.refreshAccessToken());
            } catch (refreshError) {
                // Se anche il refresh fallisce, fai logout
                this.clearAuthState();
                throw refreshError;
            }
        }
    }

    refreshAccessToken(): Observable<RefreshTokenResponseModel> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const request: RefreshTokenRequestModel = { refreshToken };

        return (this.apiCatalogService.executeApiCall('auth', 'refresh', undefined, request) as Observable<RefreshTokenResponseModel>).pipe(
            tap((response: RefreshTokenResponseModel) => {
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
                    this.scheduleTokenRefresh(response.jwtToken);
                }
            })
        );
    }

    private scheduleTokenRefresh(token: string): void {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }

        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                // Token malformato, emetti inizializzazione completata
                this.authInitializedSubject.next(true);
                return;
            }

            const payload = JSON.parse(atob(parts[1]));
            const expiresAt = payload.exp * 1000;
            const now = Date.now();
            // Schedula refresh 5 minuti PRIMA della scadenza
            const refreshAt = expiresAt - (5 * 60 * 1000);
            const timeUntilRefresh = refreshAt - now;

            if (timeUntilRefresh > 0) {
                // Schedula il refresh automatico
                this.refreshTokenTimeout = setTimeout(() => {
                    this.refreshAccessToken().subscribe({
                        error: () => this.logout()
                    });
                }, timeUntilRefresh);
            }

            // Token valido, inizializzazione completata
            this.authInitializedSubject.next(true);
        } catch (error) {
            // Se c'è un errore nel parsing, emetti comunque inizializzazione completata
            this.authInitializedSubject.next(true);
        }
    }
}
