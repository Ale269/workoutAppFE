// app.initializer.ts
import { inject } from '@angular/core';
import { filter, firstValueFrom, take } from 'rxjs';
import { ApiCatalogService } from './app/core/services/api-catalog.service';
import { ErrorHandlerService } from './app/core/services/error-handler.service';
import { AuthService } from './app/core/services/auth.service';


export function initializeApp() {
  return async () => {
    const apiCatalogService = inject(ApiCatalogService);
    const errorHandler = inject(ErrorHandlerService);
    const authService = inject(AuthService);

    try {
      // Carica API Catalog (critico)
      await firstValueFrom(apiCatalogService.loadApiCatalog());

      // Verifica e refresha il token se necessario PRIMA che l'app si avvii
      await authService.verifyAndRefreshToken();
      

      // Aspetta che l'autenticazione sia completamente inizializzata
      await firstValueFrom(
        authService.authInitialized$.pipe(
          filter(initialized => initialized === true),
          take(1)
        )
      );

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
