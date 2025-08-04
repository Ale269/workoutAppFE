import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, DecimalPipe } from '@angular/common'; // DecimalPipe per il rating
import { FormsModule } from '@angular/forms'; // Per il seleziona tab
import { RouterModule } from '@angular/router';
import {MatIcon} from "@angular/material/icon"; // Se ci sono link agli annunci

// Importazioni per eventuali componenti usati, es. per le card degli annunci
// Per ora, creeremo la card dell'annuncio direttamente qui, ma in un'app reale
// avresti una componente AnnouncementCardComponent separata.

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, RouterModule, MatIcon],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfile implements OnInit {
  // Dati dell'utente (fittizi)
  user: any = {
    username: 'CollezionistaEsperto',
    profilePic: 'assets/recollect/images/item1.png', // Immagine profilo
    location: 'Milano, Italia',
    lastOnline: '2 ore fa',
    description: 'Appassionato di collezionismo e scambio di oggetti vintage. Offro e cerco pezzi unici, massima serietà.',
    averageRating: 4.6, // Media delle recensioni
    totalReviews: 25 // Numero totale di recensioni
  };

  selectedTab: 'annunci' | 'recensioni' = 'annunci'; // Tab selezionato di default

  // --- Dati Annunci (fittizi) ---
  userAnnouncements: any[] = [];
  annunciPerPage: number = 8; // 4 per riga * 2 righe, come richiesto 4 per riga max 5 righe = 20
  currentAnnunciPage: number = 1;

  // --- Dati Recensioni (fittizi) ---
  userReviews: any[] = [];
  reviewsPerPage: number = 10;
  currentReviewsPage: number = 1;

  constructor() { }

  ngOnInit(): void {
    // In un'applicazione reale, qui faresti chiamate a un servizio
    // per recuperare i dati dell'utente, degli annunci e delle recensioni.
    // Esempio: this.userService.getUserProfile(userId).subscribe(data => this.user = data);
    // this.announcementService.getUserAnnouncements(userId).subscribe(data => this.userAnnouncements = data);
    // this.reviewService.getUserReviews(userId).subscribe(data => this.userReviews = data);

    // Dati fittizi per gli annunci dell'utente
    this.userAnnouncements = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      titolo: `Annuncio Utente ${i + 1}`,
      descrizione: `Breve descrizione per l'annuncio ${i + 1}.`,
      prezzo: i % 3 === 0 ? 'Scambio' : Math.floor(Math.random() * 500) + 50,
      immagine: `assets/recollect/images/item2.png`,
      localita: `Città Fittizia ${Math.floor(Math.random() * 10)}`
    }));

    // Dati fittizi per le recensioni dell'utente
    this.userReviews = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      reviewer: `Utente Recensore ${i + 1}`,
      rating: Math.floor(Math.random() * 5) + 1, // Voto da 1 a 5
      comment: `Questa è la recensione numero ${i + 1}. Ottima esperienza, molto consigliato!`,
      date: `15/${10 - (i % 10)}/2024` // Esempio di data
    }));

    console.log("ANNUNCI: ", this.userAnnouncements);
    console.log("REVIEW: ", this.userReviews);
  }

  // Metodo per cambiare tab
  selectTab(tab: 'annunci' | 'recensioni'): void {
    this.selectedTab = tab;
  }

  // --- Logica Paginazione Annunci ---
  get paginatedAnnunci(): any[] {
    const startIndex = (this.currentAnnunciPage - 1) * this.annunciPerPage;
    const endIndex = startIndex + this.annunciPerPage;
    return this.userAnnouncements.slice(startIndex, endIndex);
  }

  get totalAnnunciPages(): number {
    return Math.ceil(this.userAnnouncements.length / this.annunciPerPage);
  }

  goToAnnunciPage(page: number): void {
    if (page >= 1 && page <= this.totalAnnunciPages) {
      this.currentAnnunciPage = page;
    }
  }

  // --- Logica Paginazione Recensioni ---
  get paginatedReviews(): any[] {
    const startIndex = (this.currentReviewsPage - 1) * this.reviewsPerPage;
    const endIndex = startIndex + this.reviewsPerPage;
    return this.userReviews.slice(startIndex, endIndex);
  }

  get totalReviewsPages(): number {
    return Math.ceil(this.userReviews.length / this.reviewsPerPage);
  }

  goToReviewsPage(page: number): void {
    if (page >= 1 && page <= this.totalReviewsPages) {
      this.currentReviewsPage = page;
    }
  }

  // Metodo per ottenere le stelle piene per le recensioni
  getStarRating(rating: number): number[] {
    return Array(Math.ceil(rating)).fill(0);
  }

  // Metodo per ottenere le stelle vuote
  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  // Helper per colori placeholder
  private getRandomColor(): string {
    const colors = ['007bff', '28a745', 'ffc107', 'dc3545', '6c757d', '17a2b8', '6610f2'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}