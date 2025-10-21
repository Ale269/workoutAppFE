import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { AuthGuard } from "./core/guards/auth.guard";
import { HomeComponent } from "./components/home-component/home-component";
import { UserProfile } from "./components/user-profile/user-profile"; // Se il tuo guard è un servizio o funzionale
import { ListTemplatePlans } from "./components/list-template-plans/list-template-plans";
import { ViewTemplatePlan } from "./components/view-template-plan/view-template-plan";
import { CreateOrEditTemplatePlanComponent } from "./components/create-or-edit-template-plan-component/create-or-edit-template-plan-component";
import { ErrorPage } from "./components/error-page/error-page";
import { NoAuthGuard } from "./core/guards/no-auth.guard";
import { InfoComponent } from "./components/info/info.component";
import { InfoBackEnd } from "./components/info-back-end/info-back-end";
import { CreateOrEditWorkoutExecution } from "./components/create-or-edit-workout-execution/create-or-edit-workout-execution";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: "profilo/:userid", // Rotta per la pagina del profilo
    component: UserProfile,
    canActivate: [AuthGuard],
  },
  {
    path: "le-mie-schede", // Rotta per la pagina del profilo
    component: ListTemplatePlans,
    canActivate: [AuthGuard],
  },
  {
    path: "le-mie-schede/visualizza-scheda/:id", // Rotta per la pagina del profilo
    component: ViewTemplatePlan,
    canActivate: [AuthGuard],
  },
  {
    path: "le-mie-schede/modifica-scheda/:id",
    component: CreateOrEditTemplatePlanComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "le-mie-schede/modifica-scheda",
    component: CreateOrEditTemplatePlanComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "registra-allenamento/:id",
    component: CreateOrEditWorkoutExecution,
    canActivate: [AuthGuard],
  },
  {
    path: "error",
    component: ErrorPage,
    canActivate: [AuthGuard],
  },
  {
    path: "info",
    component: InfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "info-server",
    component: InfoBackEnd,
    canActivate: [AuthGuard],
  },
  { path: "**", redirectTo: "home" },
];
