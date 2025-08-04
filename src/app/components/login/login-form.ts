import { FormControl, FormGroup, Validators } from "@angular/forms";

interface LoginFormModel {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

export class LoginForm {
  public form: FormGroup;

  constructor() {
    this.form = new FormGroup<LoginFormModel>({
      email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
      password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(6)]),
    });
  }

  // Un altro metodo per resettare il form
  public resetForm(): void {
    this.form.reset();
  }
}
