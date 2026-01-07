// app.initializer.ts
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiCatalogService } from './app/core/services/api-catalog.service';
import { ErrorHandlerService } from './app/core/services/error-handler.service';


export function initializeApp() {
  return async () => {
    const apiCatalogService = inject(ApiCatalogService);
    const errorHandler = inject(ErrorHandlerService);

    try {
      // Carica API Catalog (critico)
      await firstValueFrom(apiCatalogService.loadApiCatalog());

      // Nota: Gli esercizi vengono ora caricati automaticamente dopo l'autenticazione
      // dall'ExerciseService che sottoscrive a authState$

    } catch (error) {
      // Non fare throw - lascia l'app avviarsi
      errorHandler.pushCriticalError(
        error,
        'Application Bootstrap',
        {
          phase: 'initialization',
          timestamp: new Date().toISOString()
        }
      );
    }
  };
}
