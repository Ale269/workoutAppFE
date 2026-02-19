import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "./error-handler.service";
import { AuthService } from "./auth.service";
import { AllenamentoDTO as AllenamentoFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { SchedaDTO as SchedaFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/schedadto";
import { altriAllenamentiSelectDTO } from "src/app/models/view-modifica-allenamento-svolto/altri-allenamenti-select-dto";

// --- Workout Execution ---

export interface WorkoutStorageData {
  version: number;
  createOrEdit: number;
  idTemplateAllenamento: number;
  idAllenamento: number;
  formDTO: AllenamentoFormDTO;
  accordionOpenKeys: string[];
  opzioniAltriAllenamenti: altriAllenamentiSelectDTO[];
  savedAt: string;
}

// --- Template Plan ---

export interface TemplateStorageData {
  version: number;
  schedaId: number;
  formDTO: SchedaFormDTO;
  savedAt: string;
}

const WORKOUT_KEY_PREFIX = "workout_in_progress_";
const TEMPLATE_KEY_PREFIX = "template_in_progress_";
const CURRENT_VERSION = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 ore

@Injectable({ providedIn: "root" })
export class WorkoutStorageService {
  constructor(
    private errorHandlerService: ErrorHandlerService,
    private authService: AuthService,
  ) {}

  private getUserSuffix(): string {
    const user = this.authService.getCurrentUser();
    return String(user?.userId || "anonymous");
  }

  // =====================
  // Workout Execution
  // =====================

  save(data: WorkoutStorageData): void {
    try {
      data.version = CURRENT_VERSION;
      data.savedAt = new Date().toISOString();
      localStorage.setItem(
        WORKOUT_KEY_PREFIX + this.getUserSuffix(),
        JSON.stringify(data),
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutStorageService.save",
      );
    }
  }

  load(): WorkoutStorageData | null {
    try {
      const raw = localStorage.getItem(
        WORKOUT_KEY_PREFIX + this.getUserSuffix(),
      );
      if (!raw) {
        return null;
      }

      const data: WorkoutStorageData = JSON.parse(raw);

      if (!data || data.version !== CURRENT_VERSION) {
        this.clear();
        return null;
      }

      if (this.isStale(data.savedAt)) {
        this.clear();
        return null;
      }

      // Riconverti dataEsecuzione da stringa a Date
      if (data.formDTO?.dataEsecuzione) {
        data.formDTO.dataEsecuzione = new Date(data.formDTO.dataEsecuzione);
      }

      return data;
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutStorageService.load",
      );
      this.clear();
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(WORKOUT_KEY_PREFIX + this.getUserSuffix());
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutStorageService.clear",
      );
    }
  }

  hasMatchingData(
    createOrEdit: number,
    idTemplateAllenamento: number,
    idAllenamento: number,
  ): boolean {
    const data = this.load();
    if (!data) return false;
    return (
      data.createOrEdit === createOrEdit &&
      data.idTemplateAllenamento === idTemplateAllenamento &&
      data.idAllenamento === idAllenamento
    );
  }

  // =====================
  // Template Plan
  // =====================

  saveTemplate(data: TemplateStorageData): void {
    try {
      data.version = CURRENT_VERSION;
      data.savedAt = new Date().toISOString();
      localStorage.setItem(
        TEMPLATE_KEY_PREFIX + this.getUserSuffix(),
        JSON.stringify(data),
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutStorageService.saveTemplate",
      );
    }
  }

  loadTemplate(): TemplateStorageData | null {
    try {
      const raw = localStorage.getItem(
        TEMPLATE_KEY_PREFIX + this.getUserSuffix(),
      );
      if (!raw) {
        return null;
      }

      const data: TemplateStorageData = JSON.parse(raw);

      if (!data || data.version !== CURRENT_VERSION) {
        this.clearTemplate();
        return null;
      }

      if (this.isStale(data.savedAt)) {
        this.clearTemplate();
        return null;
      }

      return data;
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutStorageService.loadTemplate",
      );
      this.clearTemplate();
      return null;
    }
  }

  clearTemplate(): void {
    try {
      localStorage.removeItem(TEMPLATE_KEY_PREFIX + this.getUserSuffix());
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutStorageService.clearTemplate",
      );
    }
  }

  // =====================
  // Shared
  // =====================

  private isStale(savedAt: string): boolean {
    const savedTime = new Date(savedAt).getTime();
    const now = Date.now();
    return now - savedTime > MAX_AGE_MS;
  }
}
