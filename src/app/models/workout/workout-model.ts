import {BaseResponseModel} from "../base-response/base-response";
import {SchedaDTO} from "../modifica-scheda/schedadto";

export interface GetSingleWorkoutRequestModel {
    username: string;
    password: string;
}

export interface GetSingleWorkoutResponsetModel extends BaseResponseModel {
    workouts: SchedaDTO[];
}