// app.initializer.ts
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiCatalogService } from './app/core/services/api-catalog.service';
import { ErrorHandlerService } from './app/core/services/error-handler.service';
import { ExerciseService } from './app/core/services/exercise.service';


export function initializeApp() {
  return async () => {
    const apiCatalogService = inject(ApiCatalogService);
    const exerciseService = inject(ExerciseService);
    const errorHandler = inject(ErrorHandlerService);

    try {
      // Carica API Catalog (critico)
      await firstValueFrom(apiCatalogService.loadApiCatalog());

      // Carica Exercises (dipende da API Catalog)
      await exerciseService.initializeExercises();
      
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
