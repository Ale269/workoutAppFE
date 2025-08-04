
import {Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private themeSubject = new BehaviorSubject<string>('light-theme');
    public currentTheme$ = this.themeSubject.asObservable();
    //public renderer: Renderer2;

    constructor(){//(renderer: Renderer2) {
        //this.renderer = renderer;
        this.loadTheme();
    }

    toggleTheme(): void {
        const currentTheme = this.themeSubject.value;
        ///this.renderer.removeClass(document.body, currentTheme);
        const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
        this.setTheme(newTheme);
    }

    setTheme(theme: string): void {
        this.themeSubject.next(theme);
        localStorage.setItem('theme', theme);
        document.body.className = theme;
        //this.renderer.addClass(document.body,theme);
    }

    private loadTheme(): void {
        //const savedTheme = localStorage.getItem('theme') || 'light-theme';
        const savedTheme = 'light-theme';
        this.setTheme(savedTheme);
    }

    getCurrentTheme(): string {
        return this.themeSubject.value;
    }

    isDarkMode(): boolean {
        return this.getCurrentTheme() === 'dark-theme';
    }
}
