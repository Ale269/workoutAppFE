import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import gsap from "gsap";
import { AllenamentoForm } from "../../workout-form";
import { EsercizioForm } from "../../exercise-form";
import { GruppoForm } from "../../group-form";
import { ExerciseComponent } from "../exercise-component/exercise-component";
import { GroupCompactCard } from "../group-compact-card/group-compact-card";
import { ReorderExerciseComponent } from "../reorder-exercise-component/reorder-exercise-component";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ModalService } from "src/app/core/services/modal.service";
import { HapticService } from "src/app/core/services/haptic.service";
import { HapticSwitchDirective } from "src/app/components/shared/directives/haptic-switch.directive";
import { FocusOverlayService } from "src/app/components/shared/focus-overlay/focus-overlay.service";

/**
 * Contenitore di un gruppo di esercizi (superset / circuito):
 * header colorato con titolo auto-numerato e X di eliminazione (con conferma),
 * campi recupero/giri, riordino interno dei membri, aggiunta esercizi al gruppo.
 * In modalità compatta collassa nella card riassuntiva (app-group-compact-card).
 */
@Component({
  selector: "app-exercise-group",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    ExerciseComponent,
    GroupCompactCard,
    HapticSwitchDirective,
  ],
  templateUrl: "./exercise-group-component.html",
  styleUrl: "./exercise-group-component.scss",
})
export class ExerciseGroupComponent {
  @Input() formAllenamento!: AllenamentoForm;
  @Input() gruppo!: GruppoForm;
  @Input() numero: number = 1;
  @Input() isCompactMode: boolean = false;
  @Input() historyTrainingId?: number;

  @Output() onDeleteExercise = new EventEmitter<number>();
  @Output() addExercise = new EventEmitter<number>();

  @ViewChild("headerDeleteGroup") headerDeleteGroup!: TemplateRef<any>;
  @ViewChild("bodyDeleteGroup") bodyDeleteGroup!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteGroup")
  footerCloseDeleteGroup!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteGroup")
  footerConfirmDeleteGroup!: TemplateRef<any>;

  @ViewChild("groupExercisesContainer", { read: ElementRef })
  groupExercisesContainer!: ElementRef;

  // Modalità compatta locale ai membri durante il riordino interno al gruppo
  public membersCompact: boolean = false;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService,
    private hapticService: HapticService,
    private focusOverlayService: FocusOverlayService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIcon(
      "google-close-icon",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-close-icon.svg",
      ),
    );
    iconRegistry.addSvgIcon(
      "google-reorder",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-reorder.svg",
      ),
    );
    iconRegistry.addSvgIcon(
      "google-add",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-add.svg",
      ),
    );
  }

  /**
   * Membri del gruppo letti SEMPRE dallo stato corrente del form (non da un
   * input del parent): dopo un riordino interno il change detection locale
   * basta a mostrare il nuovo ordine.
   */
  get esercizi(): EsercizioForm[] {
    return this.formAllenamento.listaEserciziForm.filter(
      (esercizio) => esercizio.idGruppo === this.gruppo.identifier,
    );
  }

  get isCircuit(): boolean {
    return this.gruppo.tipoGruppo === "CIRCUIT";
  }

  get titolo(): string {
    return this.isCircuit
      ? `Circuito ${this.numero}`
      : `Superset ${this.numero}`;
  }

  get reorderLabel(): string {
    return this.isCircuit ? "Riordina circuito" : "Riordina superset";
  }

  get addLabel(): string {
    return this.isCircuit ? "Aggiungi a circuito" : "Aggiungi a superset";
  }

  deleteExerciseFromGroup(identifier: number): void {
    this.onDeleteExercise.emit(identifier);
  }

  addEsercizio(): void {
    try {
      this.hapticService.trigger("medium");
      this.addExercise.emit(this.gruppo.identifier);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseGroupComponent.addEsercizio",
      );
    }
  }

  openDeleteGroupModal(): void {
    try {
      this.hapticService.trigger("error");
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteGroup,
        bodyTemplate: this.bodyDeleteGroup,
        footerCloseTemplate: this.footerCloseDeleteGroup,
        footerConfirmTemplate: this.footerConfirmDeleteGroup,
        onConfirm: () => this.deleteGroup(),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseGroupComponent.openDeleteGroupModal",
      );
    }
  }

  private deleteGroup(): void {
    try {
      this.hapticService.trigger("error");
      this.formAllenamento.deleteGruppo(this.gruppo.identifier);
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseGroupComponent.deleteGroup",
      );
    }
  }

  /**
   * Riordino interno: collassa solo i membri del gruppo e apre il classico
   * overlay di riordino limitato a questi esercizi.
   */
  reorderMembers(): void {
    try {
      if (this.esercizi.length === 0) return;

      this.hapticService.trigger("medium");
      this.membersCompact = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.openMembersReorderOverlay();
      }, 350);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseGroupComponent.reorderMembers",
      );
    }
  }

  private openMembersReorderOverlay(): void {
    const containerEl = this.groupExercisesContainer.nativeElement;
    const containerRect = containerEl.getBoundingClientRect();
    const containerPosition = {
      top: containerRect.top,
      left: containerRect.left,
      width: containerRect.width,
      height: containerRect.height,
    };

    const groupIdentifier = this.gruppo.identifier;

    const controller = this.focusOverlayService.open({
      component: ReorderExerciseComponent,
      data: {
        exercises: this.esercizi,
        containerPosition: containerPosition,
      },
      dismissOnBackdrop: false,
      onDismiss: () => {
        // I callback dell'overlay girano fuori dalla zone di Angular:
        // rientra per far propagare gli input dal parent
        this.ngZone.run(() => {
          this.membersCompact = false;
          this.cdr.detectChanges();
        });
      },
    });

    controller.registerOnPositionedFn(() => {
      this.setMembersVisibility(false);
    });

    controller.registerGetContainerPositionFn(() => {
      const rect =
        this.groupExercisesContainer.nativeElement.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    });

    controller.registerOnReadyToShowFn(() => {
      this.setMembersVisibility(true);
    });

    controller.registerApplyNewOrderFn((orderedIdentifiers: number[]) => {
      this.ngZone.run(() => {
        this.formAllenamento.reorderGroupMembers(
          groupIdentifier,
          orderedIdentifiers,
        );
        this.cdr.detectChanges();
      });
    });
  }

  private setMembersVisibility(visible: boolean): void {
    if (this.groupExercisesContainer) {
      const containerEl = this.groupExercisesContainer
        .nativeElement as HTMLElement;
      gsap.set(containerEl, { autoAlpha: visible ? 1 : 0 });
    }
  }
}
