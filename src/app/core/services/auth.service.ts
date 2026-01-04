
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { Router } from '@angular/router';
import {ApiCatalogService} from "./api-catalog.service";
import { LoginRequestModel, LoginResponseModel } from 'src/app/models/auth/login-model';
import { SignupRequestModel, SignupResponseModel } from 'src/app/models/auth/signup-model';
import {AuthStateModel} from "../../models/user/auth-state-model";
import {UserModel} from "../../models/user/user-model";
import {ErrorHandlerService} from "./error-handler.service";
import {SpinnerService} from "./spinner.service";

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

    setAuthState(user: UserModel, token: string): void {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);

         this.authStateSubject.next({
             isAuthenticated: true,
             user: user,
             token: token
         });
    }

    private clearAuthState(): void {
         localStorage.removeItem('token');
         localStorage.removeItem('user');

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
}
