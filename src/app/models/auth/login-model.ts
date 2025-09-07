import { BaseResponseModel } from "../base-response/base-response";

export interface LoginRequestModel {
  username: string;
  password: string;
}

export interface LoginResponseModel extends BaseResponseModel {
  usedId: number;
  username: string;
  jwtToken: string;
  expiresIn: number;
}
