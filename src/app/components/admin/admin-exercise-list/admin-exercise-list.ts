import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { ExerciseService } from "src/app/core/services/exercise.service";
import { AuthService } from "src/app/core/services/auth.service";
import { ExerciseTypeDTO } from "src/app/models/exercise/exercisedto";
import { getIconPathById } from "src/app/components/enums/exercise-icons";

@Component({
  selector: "app-admin-exercise-list",
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: "./admin-exercise-list.html",
  styleUrl: "./admin-exercise-list.scss",
})
export class AdminExerciseListComponent implements OnInit {
  public exerciseList: ExerciseTypeDTO[] = [];
  private currentSpinnerId: string | null = null;
  private currentUserId: number = 0;
  private isAdmin: boolean = false;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private exerciseService: ExerciseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      const currentUser = this.authService.getCurrentUser();
      this.currentUserId = currentUser?.userId || 0;
      this.isAdmin = currentUser?.role === 'ADMIN';
      this.loadExercises();
    } catch (error) {
      this.errorHandlerService.logError(error, "AdminExerciseList.ngOnInit");
    }
  }

  loadExercises(): void {
    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Caricamento esercizi",
        {
          successMessage: "Esercizi caricati con successo",
          errorMessage: "Errore nel caricamento esercizi",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      const exercises = this.exerciseService.getExercises();
      if (exercises && exercises.length > 0) {
        this.exerciseList = exercises;
        if (this.currentSpinnerId) {
          this.spinnerService.setSuccess(this.currentSpinnerId);
        }
      } else {
        this.exerciseService.initializeExercises().then(() => {
          this.exerciseList = this.exerciseService.getExercises() || [];
          if (this.currentSpinnerId) {
            this.spinnerService.setSuccess(this.currentSpinnerId);
          }
        }).catch((error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.logError(error, "AdminExerciseList.loadExercises");
        });
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(error, "AdminExerciseList.loadExercises");
    }
  }

  createNewExercise(): void {
    try {
      this.router.navigate(["/admin/exercises/create"]);
    } catch (error) {
      this.errorHandlerService.logError(error, "AdminExerciseList.createNewExercise");
    }
  }

  editExercise(exerciseId: number): void {
    try {
      this.router.navigate(["/admin/exercises/edit", exerciseId]);
    } catch (error) {
      this.errorHandlerService.logError(error, "AdminExerciseList.editExercise");
    }
  }

  deleteExercise(exerciseId: number, exerciseName: string): void {
    try {
      if (
        confirm(
          `Sei sicuro di voler eliminare l'esercizio "${exerciseName}"? Questa azione è irreversibile.`
        )
      ) {
        this.currentSpinnerId = this.spinnerService.showWithResult(
          "Eliminazione esercizio",
          {
            successMessage: "Esercizio eliminato con successo",
            errorMessage: "Errore nell'eliminazione esercizio",
            resultDuration: 250,
            minSpinnerDuration: 250,
          }
        );

        this.exerciseService.deleteExercise(exerciseId, this.currentUserId).subscribe({
          next: (response) => {
            if (!response.errore?.error) {
              if (this.currentSpinnerId) {
                this.spinnerService.setSuccess(this.currentSpinnerId);
              }
              this.exerciseService.reloadExercises().then(() => {
                this.loadExercises();
              });
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "AdminExerciseList.deleteExercise"
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "AdminExerciseList.deleteExercise"
            );
          },
        });
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(error, "AdminExerciseList.deleteExercise");
    }
  }

  canModify(exercise: ExerciseTypeDTO): boolean {
    return this.exerciseService.canUserModifyExercise(exercise, this.currentUserId, this.isAdmin);
  }

  getTypeBadgeClass(isStandard: boolean): string {
    return isStandard ? "badge-standard" : "badge-custom";
  }

  getExerciseIconPath(iconId: number): string {
    return getIconPathById(iconId);
  }

  getMuscleNames(exercise: ExerciseTypeDTO): string {
    const muscles = this.exerciseService.getMuscleGroups();
    return exercise.idMuscoli
      .map((id) => muscles.find((m) => m.id === id)?.name)
      .filter((name) => !!name)
      .join(", ");
  }
}
