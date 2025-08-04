import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterOutlet} from "@angular/router";
import {AuthService} from "../../core/services/auth.service";
import {User} from "../../core/models/user.model";
import {MatButton} from "@angular/material/button";
import {Yacht} from "../../core/models/yacht.model";
import {MatIcon} from "@angular/material/icon";
import {AddYachtModal} from "../shared/modals/add-yacht-modal/add-yacht-modal";

@Component({
  selector: 'app-yacht-dashboard',
  imports: [
    MatButton,
    AddYachtModal
  ],
  templateUrl: './yacht-dashboard.html',
  styleUrl: './yacht-dashboard.scss'
})
export class YachtDashboard implements OnInit{

  yachtId: string | null = null; // Per il futuro, quando selezionerai uno yacht specifico
  currentUser: User | null = null;
  //yachtList: (<Yacht>() => []) | undefined;
  yachtList: Yacht[] = []; // Lista di yacht, da popolare con i dati reali
  selectedYacht: Yacht | null = null;
  isAddYachtModalVisible: boolean = false;

  constructor(
      private authService: AuthService,
      private route: ActivatedRoute) {
    this.authService = authService;
      // Initialization logic can go here if needed
  }

  ngOnInit(): void {
    console.log("CURRENT USER:", this.authService.getCurrentUser());
    this.currentUser = this.authService.getCurrentUser();

    // Ora puoi usare this.currentUser per personalizzare la dashboard
    // ad esempio, mostrare diverse sezioni basate sul ruolo (HOD, CREW, ADMIN)
    if (this.currentUser?.role === 'HOD') {
      console.log('User is a HOD. Displaying HOD features.');
    } else if (this.currentUser?.role === 'CREW') {
      console.log('User is a CREW. Displaying CREW features.');
    }

  }


  onSelectYacht(yacht: Yacht) {

  }

  onGoToDashboard(id: string) {

  }

  onDeleteYacht(id: string) {

  }

  addNewYacth() {
    this.isAddYachtModalVisible = true;
  }

  closeAddYachtModal() {
    this.isAddYachtModalVisible = false;
  }

  onYachtAdded($event: Partial<Yacht>) {

  }
}
