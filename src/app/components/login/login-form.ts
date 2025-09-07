import { FormControl, FormGroup, Validators } from "@angular/forms";

interface LoginFormModel {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

export class LoginForm {
  public form: FormGroup;

  constructor() {
    this.form = new FormGroup<LoginFormModel>({
      username: new FormControl<string | null>(null, [Validators.required]),
      password: new FormControl<string | null>(null, [Validators.required]),
    });
  }

  // Un altro metodo per resettare il form
  public resetForm(): void {
    this.form.reset();
  }
}
