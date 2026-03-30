import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ApiCatalogService } from "./api-catalog.service";
import { ErrorHandlerService } from "./error-handler.service";
import {
  DEFAULT_USER_CONFIG,
  UpdateUserConfigRequestModel,
  UpdateUserConfigResponseModel,
  UserConfigModel,
  UserConfigResponseModel,
} from "src/app/models/user-config/user-config-model";

@Injectable({
  providedIn: "root",
})
export class UserConfigService {
  private configSubject = new BehaviorSubject<UserConfigModel>({ ...DEFAULT_USER_CONFIG });
  public config$ = this.configSubject.asObservable();

  private currentUserId: number = 0;
  private initializationPromise: Promise<void> | null = null;

  private apiCatalogService = inject(ApiCatalogService);
  private errorHandlerService = inject(ErrorHandlerService);

  getConfig(): UserConfigModel {
    return this.configSubject.value;
  }

  getSetting<K extends keyof UserConfigModel>(key: K): UserConfigModel[K] {
    return this.configSubject.value[key];
  }

  initializeConfig(userId: number): Promise<void> {
    this.currentUserId = userId;

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise<void>((resolve) => {
      this.apiCatalogService
        .executeApiCall<UserConfigResponseModel>("userConfig", "getUserConfig", { userId }, null)
        .subscribe({
          next: (response) => {
            this.initializationPromise = null;
            if (!response.errore?.error && response.configurazione) {
              this.configSubject.next({
                ...DEFAULT_USER_CONFIG,
                ...response.configurazione,
              });
            }
            // Se errore o configurazione null, manteniamo i default
            resolve();
          },
          error: () => {
            this.initializationPromise = null;
            // Fallback silenzioso ai default
            resolve();
          },
        });
    });

    return this.initializationPromise;
  }

  updateConfig(partial: Partial<UserConfigModel>): void {
    const previous = this.configSubject.value;
    const updated = { ...previous, ...partial };
    this.configSubject.next(updated);

    const request: UpdateUserConfigRequestModel = {
      userId: this.currentUserId,
      configurazione: updated,
    };

    this.apiCatalogService
      .executeApiCall<UpdateUserConfigResponseModel>("userConfig", "updateUserConfig", { userId: this.currentUserId }, request)
      .subscribe({
        next: (response) => {
          if (response.errore?.error) {
            this.configSubject.next(previous);
            this.errorHandlerService.logError(
              response.errore.errorMessage,
              "UserConfigService.updateConfig",
            );
          }
        },
        error: (error) => {
          this.configSubject.next(previous);
          this.errorHandlerService.logError(
            error,
            "UserConfigService.updateConfig",
          );
        },
      });
  }

  reset(): void {
    this.configSubject.next({ ...DEFAULT_USER_CONFIG });
    this.currentUserId = 0;
    this.initializationPromise = null;
  }
}
