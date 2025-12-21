import { BaseResponseModel } from "../base-response/base-response";
import { RoleEnum } from "../user/user-model";

export interface LoginRequestModel {
  username: string;
  password: string;
}

export interface LoginResponseModel extends BaseResponseModel {
  userId: number;
  username: string;
  jwtToken: string;
  expiresIn: number;
  role?: RoleEnum;
  email?: string;
  name?: string;
  surname?: string;
}
