import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importa CommonModule per ngIf/ngClass
import { TranslateModule } from '@ngx-translate/core';
import {Yacht} from "../../../../core/models/yacht.model"; // Per la traduzione, se la usi

@Component({
  selector: 'app-add-yacht-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule // Se usi il modulo di traduzione
  ],
  templateUrl: './add-yacht-modal.html',
  styleUrl: './add-yacht-modal.scss'
})
export class AddYachtModal implements OnInit {
  @Input() isVisible: boolean = false; // Controlla la visibilità della modale
  @Output() close = new EventEmitter<void>(); // Emette quando la modale viene chiusa
  @Output() yachtAdded = new EventEmitter<Partial<Yacht>>(); // Emette i dati del nuovo yacht

  addYachtForm!: FormGroup; // Form Group per la gestione del form

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addYachtForm = this.fb.group({
      name: ['', Validators.required], // Campo obbligatorio
      description: [''] // Campo opzionale
    });
  }

  // Metodo per chiudere la modale
  onClose(): void {
    this.close.emit();
    this.addYachtForm.reset(); // Resetta il form alla chiusura
  }

  // Metodo per inviare il form
  onSubmit(): void {
    if (this.addYachtForm.valid) {
      // Creiamo un oggetto Partial<Yacht> con i dati del form
      const newYachtData: Partial<Yacht> = {
        name: this.addYachtForm.value.name,
        description: this.addYachtForm.value.description
        // id, accountId, isActive, createdAt, updatedAt verranno gestiti dal backend
      };
      this.yachtAdded.emit(newYachtData);
      this.onClose(); // Chiudi la modale dopo aver aggiunto lo yacht
    } else {
      // Marca tutti i campi come touched per mostrare gli errori di validazione
      this.addYachtForm.markAllAsTouched();
    }
  }
}
