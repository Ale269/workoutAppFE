import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule, Validators } from "@angular/forms";
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
import { AdminService } from "src/app/core/services/admin.service";
import { AdminUserForm } from "./admin-user-form-model";
import { CreateUserRequestModel, UpdateUserRequestModel } from "src/app/models/user/user-management-models";

@Component({
  selector: "app-admin-user-form",
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
  templateUrl: "./admin-user-form.html",
  styleUrl: "./admin-user-form.scss",
})
export class AdminUserFormComponent implements OnInit {
  public userForm!: AdminUserForm;
  public userId: number | null = null;
  public isEditMode = false;
  private currentSpinnerId: string | null = null;

  // Toggle per visualizzare password
  public hidePassword = true;
  public hideConfirmPassword = true;

  public roleOptions = [
    { value: 'USER', label: 'Utente' },
    { value: 'ADMIN', label: 'Amministratore' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService
  ) {
    try {
      this.userForm = new AdminUserForm();
    } catch (error) {
      this.errorHandlerService.handleError(error, "AdminUserForm.constructor");
    }
  }

  ngOnInit(): void {
    try {
      // Verifica se siamo in modalità modifica
      this.route.params.subscribe((params) => {
        if (params['id']) {
          this.userId = +params['id'];
          this.isEditMode = true;
          this.loadUserData();
        } else {
          // Modalità creazione: password e conferme sono obbligatorie
          this.userForm.form.get('password')?.setValidators([
            Validators.required,
            Validators.minLength(6)
          ]);
          this.userForm.form.get('password')?.updateValueAndValidity();

          this.userForm.form.get('confirmPassword')?.setValidators([
            Validators.required
          ]);
          this.userForm.form.get('confirmPassword')?.updateValueAndValidity();

          this.userForm.form.get('confirmEmail')?.setValidators([
            Validators.required,
            Validators.email
          ]);
          this.userForm.form.get('confirmEmail')?.updateValueAndValidity();
        }
      });
    } catch (error) {
      this.errorHandlerService.handleError(error, "AdminUserForm.ngOnInit");
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  loadUserData(): void {
    if (!this.userId) return;

    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Caricamento dati utente",
        {
          successMessage: "Dati caricati con successo",
          errorMessage: "Errore nel caricamento",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      this.adminService.getUserById(this.userId).subscribe({
        next: (response) => {
          if (!response.errore?.error && response.user) {
            // Popola il form con i dati dell'utente
            this.userForm.form.patchValue({
              username: response.user.username,
              name: response.user.name,
              surname: response.user.surname,
              email: response.user.email,
              location: response.user.location,
              role: response.user.role || 'USER',
              enabled: response.user.enabled ?? true,
            });

            if (this.currentSpinnerId) {
              this.spinnerService.setSuccess(this.currentSpinnerId);
            }
          } else {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.handleError(
              response.errore?.error,
              "AdminUserForm.loadUserData"
            );
          }
        },
        error: (error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.handleError(
            error,
            "AdminUserForm.loadUserData"
          );
        },
      });
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "AdminUserForm.loadUserData"
      );
    }
  }

  onSubmit(): void {
    try {
      if (!this.userForm.form.valid) {
        this.markFormGroupTouched();
        return;
      }

      if (this.isEditMode) {
        this.updateUser();
      } else {
        this.createUser();
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(error, "AdminUserForm.onSubmit");
    }
  }

  private createUser(): void {
    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Creazione utente",
        {
          successMessage: "Utente creato con successo",
          errorMessage: "Errore nella creazione",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      const createData: CreateUserRequestModel = {
        username: this.userForm.form.value.username || undefined,
        password: this.userForm.form.value.password || undefined,
        name: this.userForm.form.value.name || undefined,
        surname: this.userForm.form.value.surname || undefined,
        email: this.userForm.form.value.email || undefined,
        location: this.userForm.form.value.location || undefined,
        role: this.userForm.form.value.role || undefined,
        enabled: this.userForm.form.value.enabled ?? undefined,
      };

      this.adminService.createUser(createData).subscribe({
        next: (response) => {
          if (!response.errore?.error) {
            if (this.currentSpinnerId) {
              this.spinnerService.setSuccess(this.currentSpinnerId);
            }
            // Torna alla lista utenti
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 500);
          } else {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.handleError(
              response.errore.error,
              "AdminUserForm.createUser"
            );
          }
        },
        error: (error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.handleError(error, "AdminUserForm.createUser");
        },
      });
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(error, "AdminUserForm.createUser");
    }
  }

  private updateUser(): void {
    try {
      if (!this.userId) {
        this.errorHandlerService.handleError(
          new Error("ID utente non trovato"),
          "AdminUserForm.updateUser"
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

      const updateData: UpdateUserRequestModel = {
        username: this.userForm.form.value.username || undefined,
        name: this.userForm.form.value.name || undefined,
        surname: this.userForm.form.value.surname || undefined,
        email: this.userForm.form.value.email || undefined,
        location: this.userForm.form.value.location || undefined,
        role: this.userForm.form.value.role || undefined,
        enabled: this.userForm.form.value.enabled ?? undefined,
      };

      this.adminService.updateUser(this.userId, updateData).subscribe({
        next: (response) => {
          if (!response.errore?.error) {
            if (this.currentSpinnerId) {
              this.spinnerService.setSuccess(this.currentSpinnerId);
            }
            // Torna alla lista utenti
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 500);
          } else {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.handleError(
              response.errore.error,
              "AdminUserForm.updateUser"
            );
          }
        },
        error: (error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.handleError(error, "AdminUserForm.updateUser");
        },
      });
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(error, "AdminUserForm.updateUser");
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.form.controls).forEach((key) => {
      const control = this.userForm.form.get(key);
      control?.markAsTouched();
    });
  }

  // Helper per mostrare errori di validazione
  getErrorMessage(fieldName: string): string {
    const control = this.userForm.form.get(fieldName);
    if (control?.hasError('required')) {
      return 'Campo obbligatorio';
    }
    if (control?.hasError('email')) {
      return 'Email non valida';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `Minimo ${requiredLength} caratteri`;
    }
    if (control?.hasError('mismatch')) {
      if (fieldName === 'confirmPassword') {
        return 'Le password non corrispondono';
      }
      if (fieldName === 'confirmEmail') {
        return 'Le email non corrispondono';
      }
    }
    return '';
  }
}
