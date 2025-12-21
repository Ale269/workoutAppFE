import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RoleEnum } from "src/app/models/user/user-model";

interface AdminUserFormModel {
  username: FormControl<string | null>;
  name: FormControl<string | null>;
  surname: FormControl<string | null>;
  email: FormControl<string | null>;
  location: FormControl<string | null>;
  role: FormControl<RoleEnum | null>;
  enabled: FormControl<boolean | null>;
}

export class AdminUserForm {
  public form: FormGroup;

  constructor() {
    this.form = new FormGroup<AdminUserFormModel>({
      username: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
      name: new FormControl<string | null>(null),
      surname: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null, [Validators.email]),
      location: new FormControl<string | null>(null),
      role: new FormControl<RoleEnum | null>('USER', [Validators.required]),
      enabled: new FormControl<boolean | null>(true, [Validators.required]),
    });
  }

  public resetForm(): void {
    this.form.reset({
      role: 'USER',
      enabled: true,
    });
  }
}
