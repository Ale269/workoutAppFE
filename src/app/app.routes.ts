import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { AuthGuard } from "./core/guards/auth.guard";
import { HomeComponent } from "./components/home-component/home-component";
import { DetailsAnnounce } from "./components/details-announce/details-announce";
import { UserProfile } from "./components/user-profile/user-profile"; // Se il tuo guard è un servizio o funzionale

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "annuncio/:id", // Questa è la nuova rotta per i dettagli dell'annuncio
    component: DetailsAnnounce,
  },
  {
    path: "profilo/:userid", // Rotta per la pagina del profilo
    component: UserProfile,
    canActivate: [AuthGuard],
  },

  { path: "**", redirectTo: "login" },
];
