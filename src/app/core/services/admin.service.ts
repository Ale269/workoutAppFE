import { Injectable } from "@angular/core";
import { ApiCatalogService } from "./api-catalog.service";
import { Observable } from "rxjs";
import {
  UserListResponseModel,
  UserDetailResponseModel,
  UpdateUserRequestModel,
  UpdateUserResponseModel,
  DeleteUserResponseModel,
  ToggleStatusResponseModel
} from "../../models/user/user-management-models";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(private apiCatalogService: ApiCatalogService) {}

  /**
   * Recupera la lista di tutti gli utenti (solo ADMIN)
   */
  getAllUsers(): Observable<UserListResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "user",
      "getAllUsers",
      undefined,
      undefined
    );
  }

  /**
   * Recupera il dettaglio di un singolo utente
   * @param userId - ID dell'utente
   */
  getUserById(userId: number): Observable<UserDetailResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "user",
      "getUserById",
      { userId },
      undefined
    );
  }

  /**
   * Aggiorna i dati di un utente (solo ADMIN)
   * @param userId - ID dell'utente
   * @param userData - Dati da aggiornare
   */
  updateUser(
    userId: number,
    userData: UpdateUserRequestModel
  ): Observable<UpdateUserResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "user",
      "updateUser",
      { userId },
      userData
    );
  }

  /**
   * Elimina un utente (solo ADMIN)
   * @param userId - ID dell'utente
   */
  deleteUser(userId: number): Observable<DeleteUserResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "user",
      "deleteUser",
      { userId },
      undefined
    );
  }

  /**
   * Abilita o disabilita un utente (solo ADMIN)
   * @param userId - ID dell'utente
   */
  toggleUserStatus(userId: number): Observable<ToggleStatusResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "user",
      "toggleUserStatus",
      { userId },
      undefined
    );
  }
}
