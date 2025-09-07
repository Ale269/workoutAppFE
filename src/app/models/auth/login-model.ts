import { BaseResponseModel } from "../base-response/base-response";

export interface LoginRequestModel {
  username: string;
  password: string;
}

export interface LoginResponseModel extends BaseResponseModel {
  username: string;
  jwtToken: string;
  expiresIn: number;
}
