import {UserModel} from "./user-model";

export interface AuthStateModel {
    isAuthenticated: boolean;
    user: UserModel | null;
    token: string | null;
}