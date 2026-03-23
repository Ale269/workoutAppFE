import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  AfterViewInit,
  ViewChild,
  effect,
  inject,
} from "@angular/core";
import {
  NavigationEnd,
  Router,
  RouterOutlet,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { ErrorHandlerService } from "./core/services/error-handler.service";
import { filter, Subject, takeUntil } from "rxjs";
import { MenuComponent } from "./components/shared/menu-component/menu-component";
import { GenericModal } from "./components/shared/generic-modal/generic-modal";
import { ModalService } from "./core/services/modal.service";
import { SpinnerService } from "./core/services/spinner.service";
import { SpinnerComponent } from "./components/shared/spinner/spinner";
import { UpdateBannerComponent } from "./components/shared/update-banner/update-banner.component";
import { OfflineIndicatorComponent } from "./components/shared/offline-indicator/offline-indicator.component";
import { BottomSheetService } from "./components/shared/bottom-sheet/bottom-sheet-service";
import { BottomSheetWrapperComponent } from "./components/shared/bottom-sheet/bottom-sheet";
import { TranslateService } from "@ngx-translate/core";
import { gsap } from "gsap";
import { AnimationService } from "./core/services/page-animation-service";
import { FocusOverlayWrapperComponent } from "./components/shared/focus-overlay/focus-overlay-wrapper";
import { FocusOverlayService } from "./components/shared/focus-overlay/focus-overlay.service";
import { BottomMenuComponent } from "./components/shared/bottom-menu/bottom-menu";
import { BottomMenuService } from "./core/services/bottom-menu.service";

@Component({
  selector: "app-root",
  standalone: true,
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  imports: [
    RouterOutlet,
    MenuComponent,
    GenericModal,
    SpinnerComponent,
    CommonModule,
    UpdateBannerComponent,
    OfflineIndicatorComponent,
    BottomSheetWrapperComponent,
    FocusOverlayWrapperComponent,
    BottomMenuComponent,
  ],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  // Dependency injection tramite inject()
  private router = inject(Router);
  private errorHandler = inject(ErrorHandlerService);
  public modalService = inject(ModalService);
  public spinnerService = inject(SpinnerService);
  public focusOverlayService = inject(FocusOverlayService);
  public bottomSheetService = inject(BottomSheetService);
  private translate = inject(TranslateService);
  private animationService = inject(AnimationService);
  public bottomMenuService = inject(BottomMenuService);

  public MenuIsVisible: boolean = false;

  @ViewChild("mainContent") mainContentRef: ElementRef | undefined;
  private mainContent: HTMLElement | null = null;

  private destroy$ = new Subject<void>();

  constructor() {
    this.translate.setDefaultLang("it");

    this.bottomMenuService.setItems([
      { icon: "bottom-home", label: "Home", route: "/home" },
      { icon: "bottom-schede", label: "Schede", route: "/le-mie-schede" },
      { icon: "bottom-allenamenti", label: "Allenamenti", route: "/allenamenti-svolti" },
      { icon: "bottom-stats", label: "Statistiche", route: "/statistiche" },
    ]);

    // Setup routing events - aggiorna solo la visibilità del menu
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateMenuVisibility(event.urlAfterRedirects || event.url);
      });

    // Monitor modali, bottom sheets e focus overlays per bloccare lo scroll
    effect(() => {
      const hasActiveModal = this.modalService.modals().length > 0;
      const hasActiveBottomSheet =
        this.bottomSheetService.activeBottomSheets().length > 0;
      const hasActiveFocusOverlay =
        this.focusOverlayService.activeOverlays().length > 0;

      this.toggleBodyScroll(
        hasActiveModal || hasActiveBottomSheet || hasActiveFocusOverlay
      );
    });
  }

  ngOnInit(): void {
    console.log("✅ AppComponent inizializzato");

    // CONTROLLO ERRORI CRITICI: Se ci sono errori critici dal bootstrap, naviga subito
    if (this.errorHandler.hasCriticalErrors()) {
      console.error("🔥 Errori critici rilevati durante il bootstrap");
      const lastError = this.errorHandler.getLastError();
      console.error("Ultimo errore:", lastError);

      this.MenuIsVisible = false;
      this.router.navigate(["/error"]).catch((err) => {
        console.error("Impossibile navigare a /error:", err);
      });
      return;
    }

    // Monitora errori critici che possono verificarsi durante l'esecuzione
    this.errorHandler.onError((error) => {
      if (error.isCritical) {
        console.error("🔥 Nuovo errore critico rilevato in runtime:", error);
        this.MenuIsVisible = false;

        // Naviga alla pagina errore
        this.router.navigate(["/error"]).catch((err) => {
          console.error("Impossibile navigare a /error:", err);
        });
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.mainContentRef) {
      this.mainContent = this.mainContentRef.nativeElement;
      
      // Registra l'elemento principale nel servizio di animazione
      // Il servizio gestirà automaticamente fade-out e fade-in
      this.animationService.setMainElement(this.mainContent);
      
      // Imposta visibilità iniziale
      gsap.set(this.mainContent, { autoAlpha: 1 });
    }
  }

  ngOnDestroy(): void {
    this.toggleBodyScroll(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toggleBodyScroll(disable: boolean): void {
    if (typeof document !== "undefined") {
      if (disable) {
        document.body.classList.add("no-scroll");
      } else {
        document.body.classList.remove("no-scroll");
      }
    }
  }

  private updateMenuVisibility(url: string): void {
    const routesWithoutMenu = [
      "/login",
      "/signin",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/error",
    ];

    this.MenuIsVisible = !routesWithoutMenu.some((route) =>
      url.toLowerCase().includes(route)
    );
  }

  onSpinnerCompleted(spinnerId: string): void {
    console.log(`Spinner ${spinnerId} completato`);
  }
}