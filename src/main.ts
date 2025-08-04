import { enableProdMode, ErrorHandler } from '@angular/core';
import { environment } from './environments/environment';
import {bootstrapApplication, BrowserModule} from '@angular/platform-browser'; // Importa bootstrapApplication
import { AppComponent } from './app/app.component'; // Importa il tuo AppComponent
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Per HttpClient e Interceptor
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Per BrowserAnimationsModule
import { provideRouter } from '@angular/router'; // Per AppRoutingModule e il routing
import { routes } from './app/app.routes'; // Assicurati di avere un file app.routes.ts con le tue rotte
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor'; // Importa il tuo interceptor
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { importProvidersFrom } from '@angular/core'; // Per importare moduli tradizionali come TranslateModule
import { GlobalErrorHandler } from './app/core/handler/global-error-handler';


// Funzione per il loader di TranslateModule
export function HttpLoaderFactory(http: HttpClient) {
    // *** QUI DEVI CAMBIARE IL PERCORSO ***
    // Il percorso deve ora includere 'recollect/'
    return new TranslateHttpLoader(http, './assets/recollect/i18n/', '.json');
}


if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        // Servizi forniti a livello di applicazione (equivalente di AppModule.providers)
        provideHttpClient(withInterceptors([AuthInterceptor])), // Fornisce HttpClient e l'interceptor
        provideAnimationsAsync(), // Fornisce BrowserAnimationsModule
        provideRouter(routes), // Fornisce il router con le tue rotte

        // Se hai un AuthGuard, forniscilo qui
        // AuthGuard (se è un servizio fornibile con provideIn: 'root' o un provideFunction)
        // Se AuthGuard è un servizio tradizionale, assicurati che sia importato e fornito correttamente qui.
        // Esempio: { provide: AuthGuard, useClass: AuthGuard }, o semplicemente AuthGuard se è provideIn: 'root'
        // Se AuthGuard è un funzionale, è usato direttamente nelle rotte.

        // Internazionalizzazione (TranslateModule) - Questo richiede un importProvidersFrom perché TranslateModule
        // è un NgModule tradizionale e non una funzione di "provide".
        importProvidersFrom(
            BrowserModule,
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient]
                }
            })
        ),
        // Serve ma ora schianta troppa roba, da attivare quando il programma non schianta di continuo sistemare
        // {
        //     provide: ErrorHandler,
        //     useClass: GlobalErrorHandler
        // }
    ]
}).catch(err => console.error(err));
