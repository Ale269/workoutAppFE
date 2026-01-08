// app.initializer.ts
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiCatalogService } from './app/core/services/api-catalog.service';
import { ErrorHandlerService } from './app/core/services/error-handler.service';
import { AuthService } from './app/core/services/auth.service';
import { ConfigurationService } from './app/core/services/configuration.service';


export function initializeApp() {
  return async () => {
    const apiCatalogService = inject(ApiCatalogService);
    const errorHandler = inject(ErrorHandlerService);
    const authService = inject(AuthService);
    const configurationService = inject(ConfigurationService);

    try {
      // Carica API Catalog (critico)
      await firstValueFrom(apiCatalogService.loadApiCatalog());

      // Verifica e refresha il token se necessario PRIMA che l'app si avvii
      await authService.verifyAndRefreshToken();

      // Se autenticato, carica le configurazioni
      if (authService.isAuthenticated()) {
        try {
          await configurationService.loadConfigurations();
        } catch (configError) {
          // Logga ma non blocca l'app
          console.error('Errore caricamento configurazioni nell\'initializer:', configError);
          errorHandler.logError(configError, 'Configuration Loading');
        }
      }

      // Token verificato, configurazioni caricate (se autenticato) - l'app può avviarsi

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
