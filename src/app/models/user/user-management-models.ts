import { UserModel } from './user-model';
import { BaseResponseModel } from '../base-response/base-response';

// Response per lista utenti
export interface UserListResponseModel extends BaseResponseModel {
  users: UserModel[];
}

// Response per dettaglio utente
export interface UserDetailResponseModel extends BaseResponseModel {
  user: UserModel;
}

// Request per aggiornamento utente
export interface UpdateUserRequestModel {
  username?: string;
  name?: string;
  surname?: string;
  email?: string;
  location?: string;
  role?: 'USER' | 'ADMIN';
  enabled?: boolean;
}

// Response per aggiornamento utente
export interface UpdateUserResponseModel extends BaseResponseModel {
  user: UserModel;
}

// Response per eliminazione utente
export interface DeleteUserResponseModel extends BaseResponseModel {
  message?: string;
}

// Response per toggle status utente
export interface ToggleStatusResponseModel extends BaseResponseModel {
  user: UserModel;
  message?: string;
}
