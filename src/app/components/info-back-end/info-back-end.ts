import { Component } from '@angular/core';
import {AppInfoService} from "../../core/services/app-info.service";
import {SpinnerService} from "../../core/services/spinner.service";
import {ErrorHandlerService} from "../../core/services/error-handler.service";

@Component({
  selector: 'app-info-back-end',
  imports: [],
  templateUrl: './info-back-end.html',
  styleUrl: './info-back-end.scss'
})
export class InfoBackEnd {

  appName = '';
  profile = '';
  description = '';
  serverTime: Date = new Date();
  version = '';
  status = '';
  isLoading = false;
  private loginSpinnerId: string | null = null;
  errorMessage = "";

  constructor(
      private appInfoService: AppInfoService,
      private spinnerService: SpinnerService, // Aggiungi spinner service
      private errorHandlerService: ErrorHandlerService,

) {
  }

  public ngOnInit() {

    try {
      this.appInfoService.getServerInfo().subscribe({

        //eleabora ok risposta
        next: (info) => {
          this.appName = info.appName;
          this.profile = info.profile;
          this.description = info.description;
          this.serverTime = info.serverTime;
          this.version = info.version;
          this.status = info.status;
        },
        error: (error) => {

          this.isLoading = false;

          let errorMsg = "Errore durante il login";

          if (error.status === 401) {
            errorMsg = "Non autorizzato";
          } else if (error.status === 404) {
            errorMsg = "Info server non trovate";
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          }

          if (this.loginSpinnerId) {
            this.spinnerService.setError(this.loginSpinnerId, errorMsg);
          }
          this.errorMessage = errorMsg;
        },
      })
    }catch (error) {
      this.isLoading = false;
      if (this.loginSpinnerId) {
        this.spinnerService.setError(this.loginSpinnerId);
      }
      this.errorHandlerService.logError(error, "LoginComponent.onLogin");
    }
  }


}
