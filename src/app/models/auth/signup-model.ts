import { BaseResponseModel } from "../base-response/base-response";

export interface SignupRequestModel {
  username: string;
  password: string;
}

export interface SignupResponseModel extends BaseResponseModel {
  isError: boolean;
}
