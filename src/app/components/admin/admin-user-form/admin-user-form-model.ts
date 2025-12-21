import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { RoleEnum } from "src/app/models/user/user-model";

// Custom Validator per confermare che due campi corrispondano
function matchFieldsValidator(fieldName: string, confirmFieldName: string) {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const field = formGroup.get(fieldName);
    const confirmField = formGroup.get(confirmFieldName);

    if (!field || !confirmField) {
      return null;
    }

    // Se il campo di conferma è vuoto, non validare (sarà gestito da required)
    if (!confirmField.value) {
      return null;
    }

    // Se i campi non corrispondono, imposta l'errore
    if (field.value !== confirmField.value) {
      confirmField.setErrors({ ...confirmField.errors, mismatch: true });
      return { mismatch: true };
    } else {
      // Rimuovi l'errore mismatch se i campi corrispondono
      const errors = confirmField.errors;
      if (errors) {
        delete errors['mismatch'];
        confirmField.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return null;
    }
  };
}

interface AdminUserFormModel {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
  name: FormControl<string | null>;
  surname: FormControl<string | null>;
  email: FormControl<string | null>;
  confirmEmail: FormControl<string | null>;
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
      password: new FormControl<string | null>(null),
      confirmPassword: new FormControl<string | null>(null),
      name: new FormControl<string | null>(null, [Validators.required]),
      surname: new FormControl<string | null>(null, [Validators.required]),
      email: new FormControl<string | null>(null, [
        Validators.required,
        Validators.email
      ]),
      confirmEmail: new FormControl<string | null>(null),
      location: new FormControl<string | null>(null, [Validators.required]),
      role: new FormControl<RoleEnum | null>('USER', [Validators.required]),
      enabled: new FormControl<boolean | null>(true, [Validators.required]),
    }, {
      validators: [
        matchFieldsValidator('password', 'confirmPassword'),
        matchFieldsValidator('email', 'confirmEmail')
      ]
    });
  }

  public resetForm(): void {
    this.form.reset({
      role: 'USER',
      enabled: true,
    });
  }
}
