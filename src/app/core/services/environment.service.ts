import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";


@Injectable({
    providedIn: 'root'
    })
export class EnvironmentService {

    ambiente: string = "-"
    url: string = "-";

    constructor(
        private http: HttpClient) {

    }

     initialize(): void {
        console.log('Initializando environment');
        var ambiente = this.getEnvironment();
        if (ambiente) {
            this.url = ambiente
            //this.ambiente = ambiente.ENVIRONMENT;
        }
    }

     getEnvironment(): string {
        return "RECOLLECT";
    }
}
