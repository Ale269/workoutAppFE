
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { MainLayoutComponent } from '../components/main-layout/main-layout.component';
import { LoginComponent } from '../components/login/login.component';
import { AuthGuard } from '../core/guards/auth.guard';
import {YachtDashboard} from "../components/yacht-dashboard/yacht-dashboard";

const routes: Routes = [
    //ordine delle rotte è importante, le rotte più specifiche devono essere prima di quelle più generiche, sono in ordine di priorità
    {
        path: '',
        component: AuthLayoutComponent,
        children: [ //queste sono chiamate rotte annidate ''+'' ''+'login'
            { path: '', redirectTo: '/login', pathMatch: 'full' },
            { path: 'login', component: LoginComponent }
        ]
    },
    {
        path: 'prova',
        component: MainLayoutComponent,
        pathMatch: 'full'
    },
    {
        path: 'yacht',
        children: [ //lazy loading, carica i moduli solo quando necessario e quando viene richiesta la rotta - i modulo contentono le info necessarie per le rotte
            {
                path: 'dashboard',
                loadComponent: () => import('../components/yacht-dashboard/yacht-dashboard').then(c => c.YachtDashboard)
            },
            {
                path: 'selection',
                loadChildren: () => import('../components/yacht-selection/yacht-selection.module').then(m => m.YachtSelectionModule)
            }
        ]
    },
    //{ path: 'user/:id', component: UserDetailComponent } test per quando ci sara yatchComponent
    //{ path: 'dashboard', component: DashboardComponent },   // 3. Altre rotte

    { path: '**', redirectTo: '/login' }
    //{ path: '**', component: LoginComponent }, // Redirect to login for any unknown routes
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
