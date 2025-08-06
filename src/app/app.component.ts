
import {Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';
import { environment } from '../environments/environment';
import {RouterLink, RouterOutlet} from "@angular/router";
import {AuthService} from "./core/services/auth.service";
import {HeaderComponent} from "./components/shared/header/header.component";
import {User} from "./core/models/user.model";
import {MatDivider, MatListItem, MatNavList} from "@angular/material/list";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatIcon} from "@angular/material/icon";
import {LoginComponent} from "./components/login/login.component";
import {isPlatformBrowser} from "@angular/common";
import {ApiCatalog} from "./core/models/api-catalog.model";
import {ApiCatalogService} from "./core/services/api-catalog.service";
import {BehaviorSubject, filter, take} from "rxjs";
import { Footer } from './components/shared/footer/footer';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        RouterOutlet,
        HeaderComponent,
        Footer,
        LoginComponent
    ]
})

export class AppComponent implements OnInit {
    panel: string = 'mainPanel';
    currentTheme = 'light-theme';
    version = environment.version;
    currentUser: User | null = null;
    showLoginModal: boolean = false;
    @ViewChild('sidenavContent') sidenavContent!: ElementRef;

    constructor(
        private translate: TranslateService,
        private themeService: ThemeService,
        private authService: AuthService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private apiCatalogService: ApiCatalogService
    ) {
        // Configura lingue supportate
        this.translate.addLangs(['en', 'it', 'es']);
        this.translate.setDefaultLang('en');

        // Rileva lingua del browser
        const browserLang = this.translate.getBrowserLang();
        const lang = browserLang?.match(/en|it|es/) ? browserLang : 'en';
        if (lang != null) {
            this.translate.use(lang);
        }

        // Sottoscriviti all'observable del catalogo API
        // Quando il catalogo API è caricato (non null), imposta isReady a true
        this.apiCatalogService.apiCatalog$
            .pipe(
                filter(catalog => catalog !== null), // Filtra finché il catalogo non è stato caricato
                take(1) // Prendi solo il primo valore valido, poi completa
            )
            .subscribe(() => {
                this.apiCatalogService.isReadySubject.next(true); // Il ProductService è ora pronto
                console.log('ProductService: API Catalog disponibile, servizio pronto: ',this.apiCatalogService.isReady$);
            });
    }

    ngOnInit(): void {
        this.themeService.currentTheme$.subscribe(theme => {
            this.currentTheme = theme;
        });

        this.authService.authState$.subscribe(authState => {
            this.currentUser = authState.user;
        });

    }

    onThemeToggle(): void {
        this.themeService.toggleTheme();
    }

    scrollToTop6() {

        if (this.sidenavContent) {
            this.sidenavContent.nativeElement.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    onLogin() {
        this.showLoginModal = true;
        if (isPlatformBrowser(this.platformId)) {
            document.body.classList.add('no-scroll');
        }
    }

    onLogout(): void {
        this.authService.logout();
    }

}
