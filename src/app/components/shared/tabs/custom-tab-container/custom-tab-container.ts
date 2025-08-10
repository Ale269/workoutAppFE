import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { gsap } from 'gsap';
import { CustomTabComponent } from '../custom-tab-components/custom-tab-components';

@Component({
  selector: 'custom-tab-container',
  templateUrl: "./custom-tab-container.html",
  styleUrls: ["./custom-tab-container.scss"],
})
export class CustomTabContainerComponent implements AfterContentInit, OnDestroy {
  @Input() activeTabId: string = '';
  @Output() activeTabIdChange = new EventEmitter<string>();
  @Output() tabChange = new EventEmitter<{ id: string, tab: CustomTabComponent, index: number }>();

  @ContentChildren(CustomTabComponent) tabs!: QueryList<CustomTabComponent>;

  private previousTabId: string = '';
  private isAnimating: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit() {
    // Inizializza i tab
    this.initializeTabs();
    
    // Ascolta i cambiamenti nella lista dei tab
    this.tabs.changes.subscribe(() => {
      this.handleTabsChange();
    });
  }

  ngOnDestroy() {
    // Cleanup GSAP animations
    gsap.killTweensOf('*');
  }

  trackByTabId(index: number, tab: CustomTabComponent): string {
    return tab.id;
  }

  private initializeTabs() {
    const tabArray = this.tabs.toArray();
    
    // Se non c'è un activeTabId impostato, usa il primo tab disponibile
    if (!this.activeTabId && tabArray.length > 0) {
      this.activeTabId = tabArray[0].id;
      this.activeTabIdChange.emit(this.activeTabId);
    }

    // Imposta lo stato attivo dei tab
    tabArray.forEach(tab => {
      tab.isActive = tab.id === this.activeTabId;
    });
  }

  private handleTabsChange() {
    const tabArray = this.tabs.toArray();
    
    // Se il tab attivo è stato rimosso, seleziona il primo disponibile
    const activeTabExists = tabArray.find(tab => tab.id === this.activeTabId);
    if (!activeTabExists && tabArray.length > 0) {
      this.selectTab(tabArray[0].id, false); // Senza animazione
    }
    
    // Se non ci sono più tab, resetta
    if (tabArray.length === 0) {
      this.activeTabId = '';
      this.activeTabIdChange.emit(this.activeTabId);
    }

    this.cdr.detectChanges();
  }

  selectTab(tabId: string, animate: boolean = true) {
    const tabArray = this.tabs.toArray();
    const targetTab = tabArray.find(tab => tab.id === tabId);
    
    if (!targetTab || targetTab.disabled || tabId === this.activeTabId || this.isAnimating) {
      return;
    }

    this.previousTabId = this.activeTabId;
    this.activeTabId = tabId;
    this.activeTabIdChange.emit(tabId);

    if (animate) {
      this.animateTabChange(tabId);
    } else {
      // Cambio immediato senza animazione
      tabArray.forEach(tab => {
        tab.isActive = tab.id === tabId;
      });
      
      const targetIndex = tabArray.findIndex(tab => tab.id === tabId);
      this.tabChange.emit({ id: tabId, tab: targetTab, index: targetIndex });
    }
  }

  private animateTabChange(newTabId: string) {
    this.isAnimating = true;

    const tabArray = this.tabs.toArray();
    const currentTab = tabArray.find(tab => tab.id === this.previousTabId);
    const newTab = tabArray.find(tab => tab.id === newTabId);

    if (!currentTab || !newTab) {
      this.isAnimating = false;
      return;
    }

    // Determina la direzione dell'animazione basata sulla posizione nella lista
    const currentIndex = tabArray.findIndex(tab => tab.id === this.previousTabId);
    const newIndex = tabArray.findIndex(tab => tab.id === newTabId);
    const isMovingForward = newIndex > currentIndex;
    const slideDirection = isMovingForward ? -100 : 100;
    const newTabStartDirection = isMovingForward ? 100 : -100;

    // Timeline GSAP per coordinare le animazioni
    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        // Aggiorna lo stato dei tab
        tabArray.forEach(tab => {
          tab.isActive = tab.id === newTabId;
        });
        // Emit dell'evento di cambio tab
        this.tabChange.emit({ id: newTabId, tab: newTab, index: newIndex });
      }
    });

    // Imposta il nuovo tab come visibile ma fuori schermo
    gsap.set(newTab.elementRef.nativeElement, {
      display: 'block',
      opacity: 0,
      x: newTabStartDirection + '%'
    });

    // Animazione del tab corrente che esce
    tl.to(currentTab.elementRef.nativeElement, {
      duration: 0.3,
      opacity: 0,
      x: slideDirection + '%',
      ease: 'power2.inOut'
    });

    // Animazione del nuovo tab che entra
    tl.to(newTab.elementRef.nativeElement, {
      duration: 0.3,
      opacity: 1,
      x: '0%',
      ease: 'power2.inOut'
    }, '-=0.1'); // Sovrappone leggermente le animazioni

    // Nascondi il tab precedente alla fine
    tl.set(currentTab.elementRef.nativeElement, {
      display: 'none'
    });
  }

  // Metodi pubblici per controllo esterno
  nextTab() {
    const tabArray = this.tabs.toArray();
    const currentIndex = tabArray.findIndex(tab => tab.id === this.activeTabId);
    
    if (currentIndex < tabArray.length - 1) {
      // Trova il prossimo tab non disabilitato
      for (let i = currentIndex + 1; i < tabArray.length; i++) {
        if (!tabArray[i].disabled) {
          this.selectTab(tabArray[i].id);
          break;
        }
      }
    }
  }

  previousTab() {
    const tabArray = this.tabs.toArray();
    const currentIndex = tabArray.findIndex(tab => tab.id === this.activeTabId);
    
    if (currentIndex > 0) {
      // Trova il precedente tab non disabilitato
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (!tabArray[i].disabled) {
          this.selectTab(tabArray[i].id);
          break;
        }
      }
    }
  }

  goToTab(tabId: string) {
    this.selectTab(tabId);
  }

  // Metodi di utilità per la gestione dinamica
  getActiveTab(): CustomTabComponent | undefined {
    return this.tabs.toArray().find(tab => tab.id === this.activeTabId);
  }

  getAllTabs(): CustomTabComponent[] {
    return this.tabs.toArray();
  }

  getTabById(tabId: string): CustomTabComponent | undefined {
    return this.tabs.toArray().find(tab => tab.id === tabId);
  }

  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }
}