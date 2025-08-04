import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe, NgIf } from '@angular/common'; // Importa CurrencyPipe e DecimalPipe
import { FormsModule } from '@angular/forms';
import {MatIcon} from "@angular/material/icon";
import {ProductsService} from "../../core/services/products.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner"; // Per la chat

@Component({
  selector: 'app-details-announce',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule, MatIcon, MatProgressSpinner],
  templateUrl: './details-announce.html',
  styleUrls: ['./details-announce.scss']
})
export class DetailsAnnounce implements OnInit {
  announceId: number | null = null;
  announce: any = null; // Qui verranno caricati i dati dell'annuncio
  chatMessage: string = ''; // Per il campo di testo della chat
  private isLoading: boolean = false;

  constructor(
      private route: ActivatedRoute, // Per accedere ai parametri della rotta
      private router: Router, // Per eventuali navigazioni (es. torna indietro)
      private productService: ProductsService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.announceId = Number(params.get('id')); // Ottieni l'ID dalla rotta
      this.loadAnnounceDetails(); // Carica i dettagli dell'annuncio
    });
  }

  loadAnnounceDetails(): void {
    if (this.announceId) {
      this.isLoading = true; // Imposta lo stato di caricamento
      this.productService.getProductById(this.announceId).subscribe({
        next: (response) => {
          //console.log("RESPONSE DETTAGLIO: ",response);
          this.isLoading = false;
          if(response){
            if(response.esito==='OK'){
              this.announce = response.payload.products
            }else{
              console.log("ERROR NOT OK")
            }
          }
        },
        error: (err) => {
          console.error(`Errore durante il caricamento dell'annuncio ${this.announceId}:`, err);
          this.isLoading = false; // Caricamento terminato anche in caso di errore
          // Reindirizza a una pagina 404 o alla home se l'annuncio non esiste
          this.router.navigate(['/home']);
        }
      });

    }
  }

  // Metodo per inviare un messaggio nella chat
  sendMessage(): void {
    if (this.chatMessage.trim()) {
      console.log('Messaggio inviato:', this.chatMessage);
      // Qui integreresti la logica per inviare il messaggio (es. a un servizio di chat)
      this.chatMessage = ''; // Pulisci il campo dopo l'invio
      // Potresti aggiungere il messaggio alla UI o gestire una notifica
    }
  }

  goBack(): void {
    this.router.navigate(['/home']); // Torna alla home page
    // Oppure this.router.navigateByUrl(this.router.url.split('/annuncio')[0]); // Per tornare all'URL precedente in modo dinamico
    // Oppure window.history.back(); // Per usare la cronologia del browser
  }
}