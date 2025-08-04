
import { Component, Output, EventEmitter } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-theme-toggle',
    templateUrl: './theme-toggle.component.html',
    standalone: true,
    styleUrls: ['./theme-toggle.component.scss'],
    imports: [
        TranslatePipe
    ]
})
export class ThemeToggleComponent {
    @Output() themeChanged = new EventEmitter<string>();
    isDarkMode = false;
    currentTheme: string | undefined;

    constructor(private themeService: ThemeService) {
        this.themeService.currentTheme$.subscribe(theme => {
            this.isDarkMode = theme === 'dark-theme';
            this.currentTheme = theme;
        });
    }

    toggleTheme(): void {
        console.log('PREMUTO SWITCH MODE DA THEMETOGGLE')
        this.themeService.toggleTheme();
        this.currentTheme = this.themeService.getCurrentTheme();
        console.log('NUOVO TEMA: ', this.currentTheme);
        this.themeChanged.emit(this.isDarkMode ? 'light-theme' : 'dark-theme');
    }
}
