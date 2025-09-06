import {Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild} from '@angular/core';
import {CommonModule, NgIf, NgFor, DecimalPipe, SlicePipe, isPlatformBrowser} from '@angular/common'; // Aggiungi DecimalPipe e SlicePipe
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';
import {SearchForm} from "../../core/models/searchform.model";
import {CATEGORIE_DISPONIBILI} from "../../common/constants";
import {ApiCatalogService} from "../../core/services/api-catalog.service";
import {ProductsService} from "../../core/services/products.service";
import { CreateOrEditWorkoutExecution } from '../create-or-edit-workout-execution/create-or-edit-workout-execution';
import { CreateOrEditTemplatePlanComponent } from '../create-or-edit-template-plan-component/create-or-edit-template-plan-component';
import { ViewTemplatePlan } from '../view-template-plan/view-template-plan';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CreateOrEditWorkoutExecution, CreateOrEditTemplatePlanComponent, ViewTemplatePlan], // Assicurati di includere FormsModule e i Pipes
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.scss']
})
export class HomeComponent implements OnInit {

  // Simulazione di dati per gli annunci
  annunci: any[] = [];
  categorieDisponibili: string[] = CATEGORIE_DISPONIBILI

  protected readonly SearchForm = SearchForm;

  // Nuove variabili per la gestione delle categorie
  selectedCategorie: string[] = []; // Array per le categorie selezionate

  searchForm: SearchForm = new SearchForm(); // Inizializza il form di ricerca

  // Stato del pannello principale dei filtri
  isFilterPanelOpen = false; // Inizialmente contratto (chiuso)
  showScrollToTopButton = false;
  showLoginModal: boolean = false;

  // Stati per la visibilità dei singoli pannelli filtro (li manteniamo per un'eventuale futura riorganizzazione)
  isCategoriaOpen = true; // Potrebbero essere usati se decidessimo di mettere accordion dentro accordion
  isLocalitaOpen = true;
  isPrezzoOpen = true;
  isDistanzaOpen = true;

  // Valori per gli slider
  distanzaMax: number = 100;
  selectedDistanza: number = 50;

  minPrice: number = 0;
  maxPrice: number = 1000;
  selectedMinPrice: number = 0;
  selectedMaxPrice: number = 500;

  @ViewChild('sidenavContent', { static: false }) sidenavContent!: ElementRef;
  private isLoading: boolean = false;
  private listData: any;


  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private renderer: Renderer2,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private apiCatalogService: ApiCatalogService,
              private productService: ProductsService) {
  }

  ngOnInit(): void {
    //this.isLoading = true; // Imposta lo stato di caricamento
    /*
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        //console.log("RESPONSE ALL PRODUCTS: ", response)
        this.isLoading = false;
        if (response.esito==="OK"){
          this.annunci = response.payload.products;
          //this.isLoading = false; // Caricamento completato
          //console.log('ANNUNCI CARICATI:', this.annunci);
        }else{
          console.log("Errore chiamata dal BE")
        }

      },
      error: (err) => {
        console.error(`Errore durante il caricamento degli annunci`, err);
        this.isLoading = false; // Caricamento terminato anche in caso di errore
        // Reindirizza a una pagina 404 o alla home se l'annuncio non esiste
        //this.router.navigate(['/home']);
      }
    });
    */
  }

  vediDettaglio(annuncioId: number): void {
    console.log('Visualizza dettaglio annuncio:', annuncioId);
    //window.location.href = window.location.origin + annuncioId;
    console.log("navigo in: ",window.location.origin + '/annuncio/' + annuncioId)
    //window.open(window.location.origin + '/annuncio/' + annuncioId)
    this.router.navigate(['/annuncio', annuncioId]);
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  // Listener per l'evento di scroll della finestra
  @HostListener('window:scroll', [])
  onWindowScroll() {
    //console.log('Window scrolled: ', window.pageYOffset);
    //console.log('document.documentElement scrolled: ', document.documentElement.scrollTop);
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.showScrollToTopButton = scrollPosition > 400;
  }


  // Questi metodi rimangono ma si riferiscono ai toggle interni ai singoli filtri,
  // che potremmo decidere di non usare subito se il pannello principale è già un accordion
  togglePanel(panel: string): void {
    if (panel === 'categoria') {
      this.isCategoriaOpen = !this.isCategoriaOpen;
    } else if (panel === 'localita') {
      this.isLocalitaOpen = !this.isLocalitaOpen;
    } else if (panel === 'prezzo') {
      this.isPrezzoOpen = !this.isPrezzoOpen;
    } else if (panel === 'distanza') {
      this.isDistanzaOpen = !this.isDistanzaOpen;
    }
  }

  onDistanzaChange(event: Event): void {
    this.selectedDistanza = +(event.target as HTMLInputElement).value;
    console.log('Distanza selezionata:', this.selectedDistanza);
  }

  onMinPriceChange(event: Event): void {
    this.selectedMinPrice = +(event.target as HTMLInputElement).value;
    console.log('Prezzo Minimo selezionato:', this.selectedMinPrice);
    // Assicurati che minPrice non superi maxPrice
    if (this.selectedMinPrice > this.selectedMaxPrice) {
      this.selectedMaxPrice = this.selectedMinPrice;
    }
  }

  onMaxPriceChange(event: Event): void {
    this.selectedMaxPrice = +(event.target as HTMLInputElement).value;
    console.log('Prezzo Massimo selezionato:', this.selectedMaxPrice);
    // Assicurati che maxPrice non sia inferiore a minPrice
    if (this.selectedMaxPrice < this.selectedMinPrice) {
      this.selectedMinPrice = this.selectedMaxPrice;
    }
  }

  onSearch(): void {
    console.log('Termine di ricerca:', this.searchForm);
    // Qui implementerai la logica di filtering degli annunci
  }

  // Metodo per scrollare la pagina in alto
  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(
          {
            top: 0,
            behavior: 'smooth'
          }
      );
      console.log('Scroll command issued.');

    } else {
      console.log('Not in browser environment, cannot scroll.');
    }
  }

  whoScroll() {
    console.log('Window scroll:', window.pageYOffset);
    console.log('Document scroll:', document.documentElement.scrollTop);
    console.log('Body scroll:', document.body.scrollTop);

    // Trova tutti gli elementi con scroll
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.scrollTop > 0) {
        console.log('Elemento con scroll:', el, 'ScrollTop:', el.scrollTop);
      }
    });
  }


  applyFilter() {
    console.log('Filtri applicati:', this.searchForm)
    this.isFilterPanelOpen = false; // Chiude il pannello dei filtri dopo l'applicazione
  }

  isValidForm(): boolean {
    return true
  }

  // Nuovo metodo per gestire il cambio delle checkbox delle categorie
  onCategoryChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const category = checkbox.value;

    if (checkbox.checked) {
      this.selectedCategorie.push(category);
    } else {
      this.selectedCategorie = this.selectedCategorie.filter(c => c !== category);
    }
    console.log('Categorie selezionate:', this.selectedCategorie);
  }

}


