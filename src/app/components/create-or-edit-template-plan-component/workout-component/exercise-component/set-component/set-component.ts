import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SerieForm } from "../../../exercise-set-form";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ModalService } from "src/app/core/services/modal.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-set-component",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./set-component.html",
  styleUrl: "./set-component.scss",
})
export class SetComponent implements OnInit {
  @Input() formSerie!: SerieForm;

  @ViewChild("headerDeleteSerie") headerDeleteSerie!: TemplateRef<any>;
  @ViewChild("bodyDeleteSerie") bodyDeleteSerie!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteSerie") footerCloseDeleteSerie!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteSerie") footerConfirmDeleteSerie!: TemplateRef<any>;

  @Output() onDeleteSerie = new EventEmitter<number>();

  public ripetizioniControl!: FormControl<number | null>;
  public caricoControl!: FormControl<number | null>;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    try {
      this.ripetizioniControl = this.formSerie.form.controls[
        "ripetizioni"
      ] as FormControl<number | null>;

      this.caricoControl = this.formSerie.form.controls[
        "carico"
      ] as FormControl<number | null>;

    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "SetComponent.ngOnInit"
      );
    }
  }

  openDeleteModal() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteSerie,
        bodyTemplate: this.bodyDeleteSerie,
        footerCloseTemplate: this.footerCloseDeleteSerie,
        footerConfirmTemplate: this.footerConfirmDeleteSerie,
        onConfirm: () => this.deleteSerie(),
        onClose: () => console.log("Modal closed"),
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "SetComponent.openDeleteModal"
      );
    }
  }

  deleteSerie() {
    try {
      this.onDeleteSerie.emit(
        this.formSerie.form.controls["identifier"].value
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "SetComponent.deleteSerie"
      );
    }
  }

  // Metodi per input numerico
  // onlyNumbers(event: KeyboardEvent): boolean {
  //   // Permette: backspace, delete, tab, escape, enter
  //   if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
  //       // Permette: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  //       (event.keyCode === 65 && event.ctrlKey === true) ||
  //       (event.keyCode === 67 && event.ctrlKey === true) ||
  //       (event.keyCode === 86 && event.ctrlKey === true) ||
  //       (event.keyCode === 88 && event.ctrlKey === true)) {
  //     return true;
  //   }
    
  //   // Assicurati che sia un numero
  //   if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
  //       (event.keyCode < 96 || event.keyCode > 105)) {
  //     event.preventDefault();
  //     return false;
  //   }
    
  //   return true;
  // }

  // onPaste(event: ClipboardEvent): void {
  //   const clipboardData = event.clipboardData;
  //   const pastedText = clipboardData?.getData('text');
    
  //   if (pastedText && !/^\d+$/.test(pastedText)) {
  //     event.preventDefault();
  //   }
  // }
}