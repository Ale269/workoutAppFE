import { BaseResponseModel } from "../base-response/base-response";

export interface UserConfigModel {
  navigaAllaHomeDopoPrimoSalvataggio: boolean;
}

export interface UserConfigResponseModel extends BaseResponseModel {
  configurazione: UserConfigModel | null;
}

export interface UpdateUserConfigRequestModel {
  userId: number;
  configurazione: UserConfigModel;
}

export interface UpdateUserConfigResponseModel extends BaseResponseModel {}

export const DEFAULT_USER_CONFIG: UserConfigModel = {
  navigaAllaHomeDopoPrimoSalvataggio: true,
};
