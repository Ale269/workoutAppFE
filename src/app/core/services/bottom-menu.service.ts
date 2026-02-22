import { Injectable, signal, DestroyRef, inject, NgZone } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface BottomMenuItem {
  icon: string;
  label: string;
  route?: string;
  action?: () => void;
}

@Injectable({ providedIn: "root" })
export class BottomMenuService {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  private _items = signal<BottomMenuItem[]>([]);
  public readonly items = this._items.asReadonly();

  private _enabled = signal<boolean>(true);
  public readonly enabled = this._enabled.asReadonly();

  private _visible = signal<boolean>(true);
  public readonly visible = this._visible.asReadonly();

  public readonly MENU_HEIGHT = 64;

  private lastScrollTop = 0;
  private scrollThreshold = 10;
  private currentScrollListener: (() => void) | null = null;
  private observer: MutationObserver | null = null;
  private currentScroller: Element | null = null;

  constructor() {
    this.updateCssVariable(true);
    this.startObserver();

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this._visible.set(true);
        this.updateCssVariable(true);
        this.lastScrollTop = 0;
      });

    this.destroyRef.onDestroy(() => {
      this.detachScrollListener();
      this.stopObserver();
    });
  }

  setItems(items: BottomMenuItem[]): void {
    this._items.set(items);
  }

  setEnabled(enabled: boolean): void {
    this._enabled.set(enabled);
    if (!enabled) {
      this._visible.set(false);
      this.updateCssVariable(false);
    }
  }

  private startObserver(): void {
    this.observer = new MutationObserver(() => {
      this.checkForNewScroller();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Check immediately in case page-scroller already exists
    this.checkForNewScroller();
  }

  private checkForNewScroller(): void {
    const scroller = document.querySelector(".page-scroller");

    if (scroller && scroller !== this.currentScroller) {
      this.lastScrollTop = 0;
      this.attachScrollListener(scroller);
    } else if (!scroller && this.currentScroller) {
      this.detachScrollListener();
    }
  }

  private stopObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private attachScrollListener(scroller: Element): void {
    this.detachScrollListener();
    this.currentScroller = scroller;

    const handler = () => {
      const scrollTop = scroller.scrollTop;
      const delta = scrollTop - this.lastScrollTop;

      if (Math.abs(delta) < this.scrollThreshold) return;

      const shouldBeVisible = delta < 0;
      if (shouldBeVisible !== this._visible()) {
        this.ngZone.run(() => {
          this._visible.set(shouldBeVisible);
          this.updateCssVariable(shouldBeVisible);
        });
      }

      this.lastScrollTop = scrollTop;
    };

    scroller.addEventListener("scroll", handler, { passive: true });
    this.currentScrollListener = () => {
      scroller.removeEventListener("scroll", handler);
      this.currentScroller = null;
    };
  }

  private detachScrollListener(): void {
    if (this.currentScrollListener) {
      this.currentScrollListener();
      this.currentScrollListener = null;
    }
  }

  private updateCssVariable(visible: boolean): void {
    const value = visible ? `${this.MENU_HEIGHT}px` : "0px";
    document.documentElement.style.setProperty("--bottom-menu-offset", value);
  }
}
