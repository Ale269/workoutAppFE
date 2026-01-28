import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatIconModule } from "@angular/material/icon";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { ExerciseService, MuscleGroup } from "src/app/core/services/exercise.service";
import { AuthService } from "src/app/core/services/auth.service";
import { AdminExerciseForm } from "./admin-exercise-form-model";
import { CreateExerciseRequestModel, UpdateExerciseRequestModel } from "src/app/models/exercise/exercise-management-models";
import { IconExerciseDTO, ExerciseTypeDTO } from "src/app/models/exercise/exercisedto";
import { getIconPathById } from "src/app/components/enums/exercise-icons";

@Component({
  selector: "app-admin-exercise-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  templateUrl: "./admin-exercise-form.html",
  styleUrl: "./admin-exercise-form.scss",
})
export class AdminExerciseFormComponent implements OnInit {
  public exerciseForm!: AdminExerciseForm;
  public exerciseId: number | null = null;
  public isEditMode = false;
  private currentSpinnerId: string | null = null;
  private currentUserId: number = 0;
  public isAdmin: boolean = false;

  public iconOptions: IconExerciseDTO[] = [];
  public muscleOptions: MuscleGroup[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService
  ) {
    try {
      this.exerciseForm = new AdminExerciseForm();
    } catch (error) {
      this.errorHandlerService.logError(error, "AdminExerciseForm.constructor");
    }
  }

  ngOnInit(): void {
    try {
      const currentUser = this.authService.getCurrentUser();
      this.currentUserId = currentUser?.userId || 0;
      this.isAdmin = currentUser?.role === 'ADMIN';

      this.iconOptions = this.exerciseService.getIcons();
      this.muscleOptions = this.exerciseService.getMuscleGroups();

      this.route.params.subscribe((params) => {
        if (params['id']) {
          this.exerciseId = +params['id'];
          this.isEditMode = true;
          this.loadExerciseData();
        }
      });
    } catch (error) {
      this.errorHandlerService.logError(error, "AdminExerciseForm.ngOnInit");
    }
  }

  loadExerciseData(): void {
    if (!this.exerciseId) return;

    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Caricamento dati esercizio",
        {
          successMessage: "Dati caricati con successo",
          errorMessage: "Errore nel caricamento",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      const exercises = this.exerciseService.getExercises();
      const exercise = exercises?.find((e) => e.idTipoEsercizio === this.exerciseId);

      if (exercise) {
        this.exerciseForm.form.patchValue({
          name: exercise.nomeTipoEsercizio,
          iconId: exercise.idIcona,
          muscleIds: exercise.idMuscoli,
          isStandard: exercise.isStandard,
        });

        if (this.currentSpinnerId) {
          this.spinnerService.setSuccess(this.currentSpinnerId);
        }
      } else {
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
        this.errorHandlerService.logError(
          new Error("Esercizio non trovato"),
          "AdminExerciseForm.loadExerciseData"
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(error, "AdminExerciseForm.loadExerciseData");
    }
  }

  onSubmit(): void {
    try {
      if (!this.exerciseForm.form.valid) {
        this.markFormGroupTouched();
        return;
      }

      if (this.isEditMode) {
        this.updateExercise();
      } else {
        this.createExercise();
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(error, "AdminExerciseForm.onSubmit");
    }
  }

  private createExercise(): void {
    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Creazione esercizio",
        {
          successMessage: "Esercizio creato con successo",
          errorMessage: "Errore nella creazione",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      const createData: CreateExerciseRequestModel = {
        name: this.exerciseForm.form.value.name || '',
        description: this.exerciseForm.form.value.description || undefined,
        iconId: this.exerciseForm.form.value.iconId || 0,
        muscleIds: this.exerciseForm.form.value.muscleIds || [],
        userId: this.currentUserId,
        isStandard: this.exerciseForm.form.value.isStandard ?? false,
      };

      this.exerciseService.createExercise(createData).subscribe({
        next: (response) => {
          if (!response.errore?.error) {
            if (this.currentSpinnerId) {
              this.spinnerService.setSuccess(this.currentSpinnerId);
            }
            this.exerciseService.reloadExercises().then(() => {
              setTimeout(() => {
                this.router.navigate(['/admin/exercises']);
              }, 500);
            });
          } else {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              response.errore.error,
              "AdminExerciseForm.createExercise"
            );
          }
        },
        error: (error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.logError(error, "AdminExerciseForm.createExercise");
        },
      });
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(error, "AdminExerciseForm.createExercise");
    }
  }

  private updateExercise(): void {
    try {
      if (!this.exerciseId) {
        this.errorHandlerService.logError(
          new Error("ID esercizio non trovato"),
          "AdminExerciseForm.updateExercise"
        );
        return;
      }

      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Salvataggio modifiche",
        {
          successMessage: "Modifiche salvate con successo",
          errorMessage: "Errore nel salvataggio",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      const updateData: UpdateExerciseRequestModel = {
        name: this.exerciseForm.form.value.name || undefined,
        description: this.exerciseForm.form.value.description || undefined,
        iconId: this.exerciseForm.form.value.iconId || undefined,
        muscleIds: this.exerciseForm.form.value.muscleIds || undefined,
      };

      this.exerciseService.updateExercise(this.exerciseId, updateData).subscribe({
        next: (response) => {
          if (!response.errore?.error) {
            if (this.currentSpinnerId) {
              this.spinnerService.setSuccess(this.currentSpinnerId);
            }
            this.exerciseService.reloadExercises().then(() => {
              setTimeout(() => {
                this.router.navigate(['/admin/exercises']);
              }, 500);
            });
          } else {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              response.errore.error,
              "AdminExerciseForm.updateExercise"
            );
          }
        },
        error: (error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.logError(error, "AdminExerciseForm.updateExercise");
        },
      });
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(error, "AdminExerciseForm.updateExercise");
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/exercises']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.exerciseForm.form.controls).forEach((key) => {
      const control = this.exerciseForm.form.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.exerciseForm.form.get(fieldName);
    if (control?.hasError('required')) {
      return 'Campo obbligatorio';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `Minimo ${requiredLength} caratteri`;
    }
    return '';
  }

  getIconPath(iconId: number): string {
    return getIconPathById(iconId);
  }
}
