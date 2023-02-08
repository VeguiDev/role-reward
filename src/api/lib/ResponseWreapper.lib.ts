import axios, { AxiosResponse } from "axios";

export async function ResponseWrapper(request:Promise<AxiosResponse>) {
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