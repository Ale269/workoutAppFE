import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import {YachtDashboard} from "./components/yacht-dashboard/yacht-dashboard";
import {HomeComponent} from "./components/home-component/home-component";
import {DetailsAnnounce} from "./components/details-announce/details-announce";
import {UserProfile} from "./components/user-profile/user-profile"; // Se il tuo guard è un servizio o funzionale

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
                data: { modal: true }
            }
        ]
    },
    {
        path: 'annuncio/:id', // Questa è la nuova rotta per i dettagli dell'annuncio
        component: DetailsAnnounce
    },
    {
        path: 'profilo/:userid', // Rotta per la pagina del profilo
        component: UserProfile,
        canActivate: [AuthGuard],
    },

    {
        path: 'yacht',
        children: [ //lazy loading, carica i moduli solo quando necessario e quando viene richiesta la rotta - i modulo contentono le info necessarie per le rotte
            {
                path: 'dashboard',
                loadComponent: () => import('./components/yacht-dashboard/yacht-dashboard').then(c => c.YachtDashboard)
            }
            //{
            //    path: ':id',
            //    loadChildren: () => import('./components/yacht-dashboard/yacht-dashboard.module').then(m => m.YachtDashboardModule)
            //}
        ]
    },
    {
        path: 'yacht-dashboard', // La rotta per la dashboard
        component: YachtDashboard, // Usa direttamente la componente qui per ora
        // Potresti volere un layout principale qui in futuro, come AppComponent o un DashboardLayoutComponent
        // Ad esempio:
        // component: AppComponent, // Se AppComponent è il layout con header/footer/sidenav
        // children: [
        //   { path: '', component: YachtDashboardComponent }
        // ],
        canActivate: [AuthGuard] // Qui aggiungerai i Guard di autenticazione
    },
    { path: '**', redirectTo: '/login' }
];
