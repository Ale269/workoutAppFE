import { FormControl, FormGroup, Validators } from "@angular/forms";

interface AdminExerciseFormModel {
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  iconId: FormControl<number | null>;
  muscleIds: FormControl<number[] | null>;
  isStandard: FormControl<boolean | null>;
}

export class AdminExerciseForm {
  public form: FormGroup;

  constructor() {
    this.form = new FormGroup<AdminExerciseFormModel>({
      name: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(2),
      ]),
      description: new FormControl<string | null>(null),
      iconId: new FormControl<number | null>(null, [Validators.required]),
      muscleIds: new FormControl<number[] | null>([], [Validators.required]),
      isStandard: new FormControl<boolean | null>(false),
    });
  }

  public resetForm(): void {
    this.form.reset({
      isStandard: false,
      muscleIds: [],
    });
  }
}
