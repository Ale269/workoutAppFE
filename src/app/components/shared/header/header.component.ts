import {Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import { User } from '../../../core/models/user.model';
import {ThemeToggleComponent} from "../theme-toggle/theme-toggle.component";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatDivider} from "@angular/material/divider";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {TranslatePipe} from "@ngx-translate/core";
import {ThemeService} from "../../../core/services/theme.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    standalone: true,
    imports: [
        ThemeToggleComponent,
        MatMenu,
        MatDivider,
        MatMenuItem,
        MatIconButton,
        MatToolbar,
        MatMenuTrigger,
        MatButton,
        TranslatePipe,
    ],
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnChanges {
    @Input() user: User | null = null;
    @Input() panel: string | undefined;
    @Output() logout = new EventEmitter<void>();
    @Output() themeToggle = new EventEmitter<string>();
    @Output() menuToggle = new EventEmitter<void>();
    currentTheme: string | undefined;
    @Output() login = new EventEmitter<boolean>();


    constructor(
        private themeService: ThemeService,
        private router: Router,) {
    }


    ngOnInit(): void {
        this.currentTheme = this.themeService.getCurrentTheme()
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    onLogout(): void {
        this.logout.emit();
    }

    onLogin(): void {
        // Implement login logic here or redirect to login page
        console.log('Login button clicked');
        this.login.emit(true);
    }

    onThemeToggle() :void {
        this.currentTheme =  this.themeService.getCurrentTheme()
        this.themeToggle.emit();
    }

    onMenuButtonClick(): void {
        this.menuToggle.emit();
    }

    getInitialName(): string {
        if (this.user && this.user.firstName) {
            return `${this.user.firstName.charAt(0).toUpperCase()}${this.user.lastName.charAt(0).toUpperCase()}`;
        }
        return '';
    }


    onFavoriteItems() {

    }

    onFavoriteSearches() {

    }

    onProfile() {
        // @ts-ignore
        this.router.navigate(['/profilo/'+this.user.id]);
    }
}
