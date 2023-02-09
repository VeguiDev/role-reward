import axios, { AxiosError, AxiosResponse } from "axios";

export interface SuccessResponse<T extends any> {

    error:null;
    data: T;
    res:AxiosResponse<T>;

}

export interface ErrorResponse {
    error:any;
    data:any|null;
    res:AxiosResponse|null;
}

export type Responses<T> = SuccessResponse<T>|ErrorResponse;

export async function ResponseWrapper<T extends any>(request:Promise<AxiosResponse>):Promise<Responses<T>> {
    try {
        const res = await request;

        return {
            error: null,
            data: res.data,
            res
        };

    } catch(e) {

        if(axios.isAxiosError(e) && e.response) {

            return {
                error: e,
                data: e.response.data,
                res: e.response
            }

        }

        return {
            error: e,
            data: null,
            res: null
        };

    }
}