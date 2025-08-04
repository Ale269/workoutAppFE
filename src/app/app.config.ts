import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Importa HttpClient
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Funzione di fabbrica per il caricatore di traduzioni
export function HttpLoaderFactory(http: HttpClient) {
    // *** QUI DEVI CAMBIARE IL PERCORSO ***
    // Il percorso deve ora includere 'recollect/'
    return new TranslateHttpLoader(http, './assets/recollect/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        // Fornisci HttpClient
        provideHttpClient(withInterceptorsFromDi()), // Importante per TranslateHttpLoader
        // Importa TranslateModule e configura il caricatore
        importProvidersFrom(
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient]
                }
            })
        )
    ]
};