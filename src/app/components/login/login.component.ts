import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import {
  ReactiveFormsModule,
} from "@angular/forms";
import {  Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { LoginRequest } from "../../core/models/auth.model";
import { TranslatePipe } from "@ngx-translate/core";
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import {  MatIconButton } from "@angular/material/button";
import { MatHint } from "@angular/material/form-field";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { LoginForm } from "./login-form";

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
    MatProgressSpinner,
    MatInput,
    MatIconButton,
    MatHint,
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private errorHandlerService: ErrorHandlerService
  ) {
    try {
      this.loginForm = new LoginForm();
      console.log(this.loginForm);
    } catch (error) {}
  }

  ngOnInit(): void {
    // Redirect se già autenticato
    if (this.authService.isAuthenticated()) {
      // this.router.navigate(["/home"]);
    }
  }

  onSubmit(): void {}


  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onForgotPassword() {
    console.log("ON CLICK FORGOT PASSWORD");
  }

  onRegister() {
    try {
      console.log("ON CLICK REGISTER");
      if (this.loginForm.form.valid) {
        this.isLoading = true;
        this.errorMessage = "";

        const credentials: LoginRequest = {
          email: this.loginForm.form.controls["email"].value,
          password: this.loginForm.form.controls["password"].value,
        };

        this.authService.registerUser(credentials).subscribe({
          next: (response) => {
            this.isLoading = false;
            //this.router.navigate(['/yacht-selection']);
          },
          error: (error) => {
            this.isLoading = false;
            throw new Error(error);
          },
        });
      }
    } catch (error) {
      this.errorHandlerService.handleError(error, "LoginComponent");
    }
  }

  onLogin() {
    console.log("Login form submitted:", this.loginForm);
    if (this.loginForm.form.valid) {
      this.isLoading = true;
      this.errorMessage = "";

      const credentials: LoginRequest = {
          email: this.loginForm.form.controls["email"].value,
          password: this.loginForm.form.controls["password"].value,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log("RESPONSE LOGIN: ", response);
          if (response.esito === "OK") {
            this.authService.setAuthState(
              response.payload.token,
              response.payload.user
            );
          } else {
            console.log("ERRORE LOGIN");
          }
          this.isLoading = false;
          this.router.navigate(["/home"]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || "Errore durante il login";
          this.router.navigate(["/home"]);
        },
      });
    }
  }
}
