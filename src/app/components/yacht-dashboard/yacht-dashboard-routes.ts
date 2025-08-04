import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {YachtDashboard} from "./yacht-dashboard";

const routes: Routes = [
  {
    path: '',
    component: YachtDashboard,
    loadComponent: () => import('./yacht-dashboard').then(c => c.YachtDashboard),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./yacht-dashboard').then(c => c.YachtDashboard)
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: YachtDashboard },
      //{ path: 'filters', component: YachtFiltersComponent }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class YachtDashboardRoutes { }
