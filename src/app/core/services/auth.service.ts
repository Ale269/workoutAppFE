
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { Router } from '@angular/router';
import {ApiCatalogService} from "./api-catalog.service";
import { LoginRequestModel, LoginResponseModel } from 'src/app/models/auth/login-model';
import { SignupRequestModel, SignupResponseModel } from 'src/app/models/auth/signup-model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // private authStateSubject = new BehaviorSubject<AuthState>({
    //     isAuthenticated: false,
    //     user: null,
    //     token: null
    // });

    // public authState$ = this.authStateSubject.asObservable();

    constructor(
        private router: Router,
        private apiCatalogService: ApiCatalogService) {
        // this.loadAuthState();
    }

    login(credentials: LoginRequestModel): Observable<LoginResponseModel> {
        //return this.autheticateUser(credentials)
        return this.apiCatalogService.executeApiCall('auth','login', undefined, credentials);
    }

    // logout(): void {
    //     this.clearAuthState();
    //     this.router.navigate(['/login']);
    // }

    // setAuthState(token: string, user: User): void {
    //     localStorage.setItem('token', token);
    //     localStorage.setItem('user', JSON.stringify(user));

    //     console.log("LOG SET USER: ", user);
    //     console.log("LOG SET token: ", token);
    //     this.authStateSubject.next({
    //         isAuthenticated: true,
    //         user: user,
    //         token: token
    //     });
    // }

    // private clearAuthState(): void {
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('user');

    //     this.authStateSubject.next({
    //         isAuthenticated: false,
    //         user: null,
    //         token: null
    //     });
    // }

    // private loadAuthState(): void {
    //     const token = localStorage.getItem('token');
    //     const userStr = localStorage.getItem('user');

    //     console.log("LOG USER: ", userStr);
    //     console.log("LOG token: ", token);
    //     if (token && userStr) {
    //         try {
    //             const user = JSON.parse(userStr);
    //             this.authStateSubject.next({
    //                 isAuthenticated: true,
    //                 user: user,
    //                 token: token
    //             });
    //         } catch (error) {
    //             this.clearAuthState();
    //         }
    //     }
    // }

    registerUser(credentials: SignupRequestModel): Observable<SignupResponseModel> {
        // Simula la registrazione di un utente
        // In un'app reale, dovresti inviare una richiesta al server per registrare l'utente
        console.log('User registered:', credentials);
        return this.apiCatalogService.executeApiCall('auth','register', undefined, credentials);
    }

    // isAuthenticated(): boolean {
    //     return this.authStateSubject.value.isAuthenticated;
    // }

    // getCurrentUser(): User | null {
    //     return this.authStateSubject.value.user;
    // }

    // getToken(): string | null {
    //     return this.authStateSubject.value.token;
    // }

    // hasRole(role: string): boolean {
    //     const user = this.getCurrentUser();
    //     return user ? user.role === role : false;
    // }

    autheticateUser(credentials: SignupRequestModel): Observable<any> {
        return this.apiCatalogService.executeApiCall('auth','login', undefined, credentials);
    }
}
