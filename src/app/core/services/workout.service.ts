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
        /*
        parametri funzionmento
        1 apiname
        2 namekey nel apiname
        3 pathparams? se è richiesto per chiamate get solitamente (senza body) endpoint sarà tipo api/workout/{workoutId}
        4 body? se è richiesto per chiamate post
        //TODO da modificare, body da passare direttamente come paramentro func getSingleWorkout
         */
        return this.apiCatalogService.executeApiCall('workout','singleUserWorkout', {workoutId: workoutId}, null);
    }

}