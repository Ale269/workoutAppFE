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
      // Piccolo delay per permettere al DOM di aggiornarsi
      setTimeout(() => {
        this.handleTabsChange();
      }, 0);
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
    
    // Se non c'è un activeTabId impostato o è vuoto, usa il primo tab disponibile e non disabilitato
    if ((!this.activeTabId || this.activeTabId.trim() === '') && tabArray.length > 0) {
      const firstAvailableTab = tabArray.find(tab => !tab.disabled);
      if (firstAvailableTab) {
        this.activeTabId = firstAvailableTab.id;
        this.activeTabIdChange.emit(this.activeTabId);
        
        // Forza l'attivazione del contenuto
        this.activateTabContent(firstAvailableTab.id);
      }
    } else {
      // Verifica che l'activeTabId corrisponda a un tab esistente e non disabilitato
      const activeTab = tabArray.find(tab => tab.id === this.activeTabId);
      if (!activeTab || activeTab.disabled) {
        const firstAvailableTab = tabArray.find(tab => !tab.disabled);
        if (firstAvailableTab) {
          this.activeTabId = firstAvailableTab.id;
          this.activeTabIdChange.emit(this.activeTabId);
          this.activateTabContent(firstAvailableTab.id);
        }
      } else {
        // Il tab attivo esiste, attivalo
        this.activateTabContent(this.activeTabId);
      }
    }
  }

  private activateTabContent(tabId: string) {
    const tabArray = this.tabs.toArray();
    
    // Imposta lo stato attivo dei tab e forza la visualizzazione
    tabArray.forEach(tab => {
      const isActive = tab.id === tabId;
      tab.isActive = isActive;
      
      // Forza l'aggiornamento del DOM
      if (isActive) {
        tab.elementRef.nativeElement.style.display = 'block';
        // Trigger dell'evento di cambio tab
        const tabIndex = tabArray.findIndex(t => t.id === tabId);
        setTimeout(() => {
          this.tabChange.emit({ id: tabId, tab: tab, index: tabIndex });
        }, 0);
      } else {
        tab.elementRef.nativeElement.style.display = 'none';
      }
    });
    
    this.cdr.detectChanges();
  }

  private handleTabsChange() {
    const tabArray = this.tabs.toArray();
    
    // Se non ci sono tab, resetta
    if (tabArray.length === 0) {
      this.activeTabId = '';
      this.activeTabIdChange.emit(this.activeTabId);
      return;
    }
    
    // Se non c'è un activeTabId o è vuoto, seleziona il primo disponibile
    if (!this.activeTabId || this.activeTabId.trim() === '') {
      const firstAvailableTab = tabArray.find(tab => !tab.disabled);
      if (firstAvailableTab) {
        this.activeTabId = firstAvailableTab.id;
        this.activeTabIdChange.emit(this.activeTabId);
        this.activateTabContent(firstAvailableTab.id);
        return;
      }
    }
    
    // Se il tab attivo è stato rimosso o è disabilitato, seleziona il primo disponibile
    const activeTabExists = tabArray.find(tab => tab.id === this.activeTabId && !tab.disabled);
    if (!activeTabExists) {
      const firstAvailableTab = tabArray.find(tab => !tab.disabled);
      if (firstAvailableTab) {
        this.activeTabId = firstAvailableTab.id;
        this.activeTabIdChange.emit(this.activeTabId);
        this.activateTabContent(firstAvailableTab.id);
      } else {
        // Tutti i tab sono disabilitati
        this.activeTabId = '';
        this.activeTabIdChange.emit(this.activeTabId);
      }
    } else {
      // Il tab attivo esiste ancora, riattivalo per sicurezza
      this.activateTabContent(this.activeTabId);
    }
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
  
  // Direzioni per l'animazione (in percentuale per essere responsive)
  const exitDirection = isMovingForward ? -100 : 100; // Il tab corrente esce verso sinistra o destra
  const enterStartDirection = isMovingForward ? 100 : -100; // Il nuovo tab inizia da destra o sinistra

  // Timeline GSAP per coordinare le animazioni
  const tl = gsap.timeline({
    onComplete: () => {
      this.isAnimating = false;
      // Aggiorna lo stato dei tab
      tabArray.forEach(tab => {
        tab.isActive = tab.id === newTabId;
      });
      
      // Reset delle proprietà CSS per evitare problemi futuri
      gsap.set([currentTab.elementRef.nativeElement, newTab.elementRef.nativeElement], {
        clearProps: "transform"
      });
      
      // Nascondi definitivamente il tab precedente
      currentTab.elementRef.nativeElement.style.display = 'none';
      
      // Emit dell'evento di cambio tab
      this.tabChange.emit({ id: newTabId, tab: newTab, index: newIndex });
    }
  });

  // FASE 1: Prepara il nuovo tab
  // Rendi visibile il nuovo tab ma posizionalo fuori schermo nella direzione corretta
  gsap.set(newTab.elementRef.nativeElement, {
    display: 'block',
    opacity: 1, // Già opaco, ma fuori schermo
    x: enterStartDirection + '%', // Posizionato completamente fuori dalla vista
    scale: 0.9 // Leggermente più piccolo per l'effetto bounce
  });

  // FASE 2: Animazione di uscita del tab corrente
  tl.to(currentTab.elementRef.nativeElement, {
    duration: 0.35,
    opacity: 0.3,
    x: exitDirection + '%',
    scale: 0.95,
    ease: "power2.in" // Accelera verso l'uscita
  });

  // FASE 3: Animazione di entrata del nuovo tab (inizia leggermente prima che finisca l'uscita)
  tl.to(newTab.elementRef.nativeElement, {
    duration: 0.5,
    x: '0%',
    scale: 1,
    ease: "back.out(1.4)", // Bounce effect simile al tuo esempio
    onStart: () => {
      // Assicurati che il nuovo tab sia completamente visibile
      newTab.elementRef.nativeElement.style.opacity = '1';
    }
  }, '-=0.15'); // Inizia 0.15s prima che finisca l'animazione precedente

  // FASE 4: Fade in finale per una transizione più smooth
  tl.to(newTab.elementRef.nativeElement, {
    duration: 0.2,
    opacity: 1,
    ease: "power1.out"
  }, '-=0.3'); // Sovrappone con l'animazione precedente
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