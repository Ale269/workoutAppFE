import {Injectable} from "@angular/core";
import {ApiCatalogService} from "./api-catalog.service";
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {SchedaDTO} from "../../models/modifica-scheda/schedadto";


@Injectable({
    providedIn: 'root'
})
export class WorkoutService {


    constructor(
        private router: Router,
        private apiCatalogService: ApiCatalogService) {

    }

    getSingleWorkout(workoutId: number): Observable<any> {
        // In un'app reale, dovresti inviare una richiesta al server per registrare l'utente
        console.log('workout request:', workoutId);
        return this.apiCatalogService.executeApiCall('workout','singleUserWorkout', undefined, {workoutId: workoutId});
    }

    getAllUserWorkout(userId: string): Observable<any> {
        // In un'app reale, dovresti inviare una richiesta al server per registrare l'utente
        console.log('all user workout:', userId);
        return this.apiCatalogService.executeApiCall('workout','allUserWorkout', {userId: userId}, undefined);

    }

}