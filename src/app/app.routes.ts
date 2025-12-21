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
import { ListExecutedWorkouts } from "./components/list-executed-workouts/list-executed-workouts";
import { ViewDataExecutedWorkout } from "./components/view-data-executed-workout/view-data-executed-workout";
import { FadeGuard } from "./core/guards/page-animation-guards";
import { AdminGuard } from "./core/guards/admin.guard";
import { AdminUserListComponent } from "./components/admin/admin-user-list/admin-user-list";
import { AdminUserFormComponent } from "./components/admin/admin-user-form/admin-user-form";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
    canDeactivate: [FadeGuard] 
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [NoAuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "profilo/:userid", // Rotta per la pagina del profilo
    component: UserProfile,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "le-mie-schede", // Rotta per la pagina del profilo
    component: ListTemplatePlans,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "le-mie-schede/visualizza-scheda/:id", // Rotta per la pagina del profilo
    component: ViewTemplatePlan,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "le-mie-schede/modifica-scheda/:id",
    component: CreateOrEditTemplatePlanComponent,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "le-mie-schede/modifica-scheda",
    component: CreateOrEditTemplatePlanComponent,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "registra-allenamento/:id",
    component: CreateOrEditWorkoutExecution,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  }, 
  {
    path: "allenamenti-svolti",
    component: ListExecutedWorkouts,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "allenamenti-svolti/visualizza-allenamento/:id",
    component: ViewDataExecutedWorkout,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "allenamenti-svolti/modifica-allenamento/:id",
    component: CreateOrEditWorkoutExecution,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  }, 
  {
    path: "error",
    component: ErrorPage,
    canDeactivate: [FadeGuard] 
  },
  {
    path: "info",
    component: InfoComponent,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard] 
  },
  {
    path: "info-server",
    component: InfoBackEnd,
    canActivate: [AuthGuard],
    canDeactivate: [FadeGuard]
  },
  {
    path: "admin/users",
    component: AdminUserListComponent,
    canActivate: [AuthGuard, AdminGuard],
    canDeactivate: [FadeGuard]
  },
  {
    path: "admin/users/create",
    component: AdminUserFormComponent,
    canActivate: [AuthGuard, AdminGuard],
    canDeactivate: [FadeGuard]
  },
  {
    path: "admin/users/edit/:id",
    component: AdminUserFormComponent,
    canActivate: [AuthGuard, AdminGuard],
    canDeactivate: [FadeGuard]
  },
  { path: "**", redirectTo: "home" },
];
