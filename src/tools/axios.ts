import axios, { AxiosRequestConfig } from 'axios'

export function request(config: any, interceptors: any) {
    const instance = axios.create({
        baseURL: "http://localhost:3210",
        timeout: 2000
    })


    if (interceptors) {
        interceptors.request.use((config: any) => {
            //TODO

            return config
        }, (err: any) => {

        })

        interceptors.response.use((res: any) => {
            return res.data
        }, (err: any) => {

        })
    }

    return instance(config)
}