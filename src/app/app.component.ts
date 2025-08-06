import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ThemeService } from "./core/services/theme.service";
import { environment } from "../environments/environment";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { AuthService } from "./core/services/auth.service";
import { User } from "./core/models/user.model";

import { LoginComponent } from "./components/login/login.component";
import { isPlatformBrowser } from "@angular/common";
import { ApiCatalogService } from "./core/services/api-catalog.service";
import { filter, Subject, take, takeUntil } from "rxjs";
import { MenuComponent } from "./components/shared/menu-component/menu-component";

@Component({
  selector: "app-root",
  standalone: true,
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  imports: [RouterOutlet, MenuComponent, LoginComponent],
})
export class AppComponent implements OnInit {
  currentTheme = "light-theme";
  currentUser: User | null = null;
  public MenuIsVisible: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,

    @Inject(PLATFORM_ID) private platformId: Object,
    private apiCatalogService: ApiCatalogService
  ) {
      // Configura lingue supportate
      this.translate.addLangs(["en", "it", "es"]);
      this.translate.setDefaultLang("en");
      
    
    
    // Rileva lingua del browser
    const browserLang = this.translate.getBrowserLang();
    const lang = browserLang?.match(/en|it|es/) ? browserLang : "en";
    if (lang != null) {
      this.translate.use(lang);
    }

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateMenuVisibility(event.urlAfterRedirects);
      });

    // Controlla anche la rotta iniziale
    this.updateMenuVisibility(this.router.url);
  }

  ngOnInit(): void {
    // this.themeService.currentTheme$.subscribe((theme) => {
    //   this.currentTheme = theme;
    // });
    // this.authService.authState$.subscribe((authState) => {
    //   this.currentUser = authState.user;
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //   onThemeToggle(): void {
  //     this.themeService.toggleTheme();
  //   }

  private updateMenuVisibility(url: string): void {
    const routesWithoutMenu = [
      "/login",
      "/auth/login",
      "/signin",
      "/register",
      "/auth/register",
      "/forgot-password",
      "/reset-password",
    ];

    this.MenuIsVisible = !routesWithoutMenu.includes(url.toLowerCase());
  }
}
