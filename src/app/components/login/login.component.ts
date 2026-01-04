import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { TranslatePipe } from "@ngx-translate/core";
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatIconButton } from "@angular/material/button";
import { MatHint } from "@angular/material/form-field";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service"; // Aggiungi import
import { LoginForm } from "./login-form";
import { LoginRequestModel } from "src/app/models/auth/login-model";
import { SignupRequestModel } from "src/app/models/auth/signup-model";
import { APP_INFO } from "src/app/core/config/app-info.config";

@Component({
  selector: "app-login",
  standalone: true,
  templateUrl: "./login.component.html",
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatLabel,
    MatError,
    MatIcon,
    MatFormField,
    MatInput,
    MatIconButton,
  ],
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  public panel: string = "loginPanel";
  public loginForm!: LoginForm;
  public isLoading = false;
  public errorMessage = "";
  public hidePassword = true;
  public version: string | undefined;

  // Aggiungi proprietà per gestire gli spinner ID
  private loginSpinnerId: string | null = null;
  private registerSpinnerId: string | null = null;
  public app_info = APP_INFO;

  constructor(
    private authService: AuthService,
    private router: Router,
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService // Aggiungi spinner service
  ) {
    try {
      this.loginForm = new LoginForm();
      console.log(this.loginForm);
    } catch (error) {
      this.errorHandlerService.logError(error, "LoginComponent.constructor");
    }
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onForgotPassword() {
    console.log("ON CLICK FORGOT PASSWORD");
    // Implementa la logica per recupero password
        alert('Funzionalità in arrivo');
  }

  onRegister() {
    try {
      console.log("ON CLICK REGISTER");

      if (!this.loginForm.form.valid) {
        this.markFormGroupTouched();
        return;
      }

      // Mostra lo spinner per la registrazione
      this.registerSpinnerId = this.spinnerService.showWithResult(
        "Registrazione in corso...",
        {
          forceShow: true,
          successMessage: "Registrazione completata con successo",
          errorMessage: "Errore durante la registrazione",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      this.isLoading = true;
      this.errorMessage = "";

      const credentials: SignupRequestModel = {
        username: this.loginForm.form.controls["username"].value,
        password: this.loginForm.form.controls["password"].value,
      };

      this.authService.signup(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;

          if (this.registerSpinnerId) {
            this.spinnerService.setSuccess(this.registerSpinnerId);
          }

          // Implementa la logica dopo registrazione riuscita
          // this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;

          if (this.registerSpinnerId) {
            this.spinnerService.setError(
              this.registerSpinnerId,
              error.error?.message || "Errore durante la registrazione"
            );
          }

          this.errorMessage =
            error.error?.message || "Errore durante la registrazione";
          this.errorHandlerService.logError(
            error,
            "LoginComponent.onRegister"
          );
        },
      });
    } catch (error) {
      this.isLoading = false;

      if (this.registerSpinnerId) {
        this.spinnerService.setError(this.registerSpinnerId);
      }

      this.errorHandlerService.logError(error, "LoginComponent.onRegister");
    }
  }

  onLogin() {
    try {

      if (!this.loginForm.form.valid) {
        this.markFormGroupTouched();
        return;
      }

      // Mostra lo spinner per il login
      this.loginSpinnerId = this.spinnerService.showWithResult(
        "Accesso in corso...",
        {
          forceShow: true,
          successMessage: "Accesso effettuato con successo",
          errorMessage: "Errore durante l'accesso",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      this.isLoading = true;
      this.errorMessage = "";

      const credentials: LoginRequestModel = {
        username: this.loginForm.form.controls["username"].value,
        password: this.loginForm.form.controls["password"].value,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          //imposto lo stato autenticato user
          this.authService.setAuthState(
            {
              userId: response.userId,
              username: response.username,
              role: response.role,
              email: response.email,
              name: response.name,
              surname: response.surname,
            },
            response.jwtToken
          );

          this.isLoading = false;
          if (this.loginSpinnerId) {
            this.spinnerService.setSuccess(this.loginSpinnerId);
          }
          // Naviga solo se login riuscito
          setTimeout(() => {
            this.router.navigate(["/home"]);
          }, 1000); // Attende che lo spinner mostri il successo
        },
        error: (error) => {
          this.isLoading = false;

          // Determina il messaggio di errore appropriato
          let errorMsg = "Errore durante il login";

          if (error.status === 401) {
            errorMsg = "Credenziali non valide";
          } else if (error.status === 404) {
            errorMsg = "Utente non trovato";
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          }

          if (this.loginSpinnerId) {
            this.spinnerService.setError(this.loginSpinnerId, errorMsg);
          }

          this.errorMessage = errorMsg;

          // NON navigare su /home in caso di errore
          this.errorHandlerService.logError(error, "LoginComponent.onLogin");
        },
      });
    } catch (error) {
      this.isLoading = false;

      if (this.loginSpinnerId) {
        this.spinnerService.setError(this.loginSpinnerId);
      }

      this.errorHandlerService.logError(error, "LoginComponent.onLogin");
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.form.controls).forEach((key) => {
      const control = this.loginForm.form.get(key);
      control?.markAsTouched();
    });
  }

  ngOnDestroy(): void {
    if (this.loginSpinnerId) {
      this.spinnerService.hide(this.loginSpinnerId);
    }
    if (this.registerSpinnerId) {
      this.spinnerService.hide(this.registerSpinnerId);
    }
  }
}
