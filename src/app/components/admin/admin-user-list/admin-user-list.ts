import { Component, OnInit } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { CommonModule } from "@angular/common";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { AdminService } from "src/app/core/services/admin.service";
import { UserModel } from "src/app/models/user/user-model";
import { Router } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-admin-user-list",
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: "./admin-user-list.html",
  styleUrl: "./admin-user-list.scss",
})
export class AdminUserListComponent implements OnInit {
  public userList: UserModel[] = [];
  private currentSpinnerId: string | null = null;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      this.loadAllUsers();
    } catch (error) {
      this.errorHandlerService.logError(error, "AdminUserList.ngOnInit");
    }
  }

  loadAllUsers(): void {
    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Caricamento utenti",
        {
          successMessage: "Utenti caricati con successo",
          errorMessage: "Errore nel caricamento utenti",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      this.adminService.getAllUsers().subscribe({
        next: (response) => {
          if (!response.errore?.error) {
            if (response.users) {
              this.userList = response.users;
              if (this.currentSpinnerId) {
                this.spinnerService.setSuccess(this.currentSpinnerId);
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore?.error,
                "AdminUserList.loadAllUsers"
              );
            }
          } else {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              response.errore.error,
              "AdminUserList.loadAllUsers"
            );
          }
        },
        error: (error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.logError(
            error,
            "AdminUserList.loadAllUsers"
          );
        },
      });
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "AdminUserList.loadAllUsers"
      );
    }
  }

  createNewUser(): void {
    try {
      this.router.navigate(["/admin/users/create"]);
    } catch (error) {
      this.errorHandlerService.logError(error, "AdminUserList.createNewUser");
    }
  }

  editUser(userId: number): void {
    try {
      this.router.navigate(["/admin/users/edit", userId]);
    } catch (error) {
      this.errorHandlerService.logError(error, "AdminUserList.editUser");
    }
  }

  toggleUserStatus(userId: number): void {
    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Modifica stato utente",
        {
          successMessage: "Stato modificato con successo",
          errorMessage: "Errore nella modifica dello stato",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      this.adminService.toggleUserStatus(userId).subscribe({
        next: (response) => {
          if (!response.errore?.error) {
            if (this.currentSpinnerId) {
              this.spinnerService.setSuccess(this.currentSpinnerId);
            }
            // Ricarica la lista per aggiornare lo stato
            this.loadAllUsers();
          } else {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              response.errore.error,
              "AdminUserList.toggleUserStatus"
            );
          }
        },
        error: (error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.logError(
            error,
            "AdminUserList.toggleUserStatus"
          );
        },
      });
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "AdminUserList.toggleUserStatus"
      );
    }
  }

  deleteUser(userId: number, username: string): void {
    try {
      if (
        confirm(
          `Sei sicuro di voler eliminare l'utente "${username}"? Questa azione è irreversibile.`
        )
      ) {
        this.currentSpinnerId = this.spinnerService.showWithResult(
          "Eliminazione utente",
          {
            successMessage: "Utente eliminato con successo",
            errorMessage: "Errore nell'eliminazione utente",
            resultDuration: 250,
            minSpinnerDuration: 250,
          }
        );

        this.adminService.deleteUser(userId).subscribe({
          next: (response) => {
            if (!response.errore?.error) {
              if (this.currentSpinnerId) {
                this.spinnerService.setSuccess(this.currentSpinnerId);
              }
              // Ricarica la lista dopo l'eliminazione
              this.loadAllUsers();
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "AdminUserList.deleteUser"
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "AdminUserList.deleteUser"
            );
          },
        });
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(error, "AdminUserList.deleteUser");
    }
  }

  getRoleBadgeClass(role?: string): string {
    return role === "ADMIN" ? "badge-admin" : "badge-user";
  }

  getStatusBadgeClass(enabled?: boolean): string {
    return enabled ? "badge-active" : "badge-inactive";
  }
}
