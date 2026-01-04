import { BaseResponseModel } from "../base-response/base-response";
import { RoleEnum } from "../user/user-model";

export interface RefreshTokenRequestModel {
  refreshToken: string;
}

export interface RefreshTokenResponseModel extends BaseResponseModel {
  userId: number;
  username: string;
  jwtToken: string;
  expiresIn: number;
  role?: RoleEnum;
  email?: string;
  name?: string;
  surname?: string;
}
