import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class TokenService {
    private token: string | null = null; // Variabile per il token

    setToken(token: string): void {
        this.token = token;
    }

    getToken(): string | null {
        return this.token;
    }

    removeToken(): void {
        this.token = null;
    }

    isTokenValid(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Aggiungi qui eventuali controlli di validità (es. scadenza)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    }
}