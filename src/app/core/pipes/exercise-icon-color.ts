// exercise-icon-color.pipe.ts
import { inject, Pipe, PipeTransform } from "@angular/core";
import { ExerciseService } from "../services/exercise.service";
import { DEFAULT_ICON_COLOR } from "src/app/components/enums/exercise-icons";

@Pipe({
  name: "exerciseIconColor",
  standalone: true,
})
export class ExerciseIconColorPipe implements PipeTransform {
  private exerciseService = inject(ExerciseService);

  transform(iconId: number | null | undefined): string {
    if (iconId == null) {
      return DEFAULT_ICON_COLOR;
    }

    // Cerchiamo il colore nella lista delle icone scaricate dal server
    const icons = this.exerciseService.getIcons(); // Assicurati di aggiungere questo getter nel service
    const iconDetail = icons.find((i) => i.idIcona === iconId);

    return iconDetail ? iconDetail.coloreIcona : DEFAULT_ICON_COLOR;
  }
}
