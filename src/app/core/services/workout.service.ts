import { Injectable } from "@angular/core";
import { ApiCatalogService } from "./api-catalog.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { SchedaDTO } from "../../models/modifica-scheda/schedadto";

@Injectable({
  providedIn: "root",
})
export class WorkoutService {
  constructor(
    private router: Router,
    private apiCatalogService: ApiCatalogService
  ) {}

  getSingleWorkout(workoutId: number): Observable<any> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "singleUserWorkout",
      { workoutId: workoutId },
      null
    );
  }

  getlistTemplatePlans(userId: string): Observable<any> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "allUserWorkout",
      { userId: userId },
      null
    );
  }
}
