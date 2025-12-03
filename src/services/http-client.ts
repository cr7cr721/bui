// services/http-client.ts
import axios, {type InternalAxiosRequestConfig} from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

const BASE_URL = "https://gdp-beam-api.dev.data.blz.dev"

let getAuthToken: () => string | null = () => null
let clearAuthToken: () => void = () => {}

export const setAuthHelpers = (
    getToken: () => string | null,
    clearToken: () => void
) => {
    getAuthToken = getToken
    clearAuthToken = clearToken
}

class HttpClient {
    private instance: AxiosInstance

    constructor() {
        this.instance = axios.create({
            baseURL: BASE_URL,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
        })

        this.setupInterceptors()
    }

    private setupInterceptors(): void {
        this.instance.interceptors.request.use(
            this.handleRequest,
            (error) => Promise.reject(error)
        )

        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            this.handleResponseError
        )
    }

    private handleRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        if (import.meta.env.DEV) {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
        }

        const token = getAuthToken()
        if (token && config.headers) {
            config.headers['x-auth-token'] = token
        }

        return config
    }

    private handleResponseError = (error: unknown): never => {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                clearAuthToken()
            }

            if (error.response) {
                const { status, statusText, data } = error.response
                const message = data?.message || statusText
                throw new Error(`API Error (${status}): ${message}`)
            }

            if (error.request) {
                throw new Error('Network Error: Unable to reach server')
            }
        }

        throw new Error(error instanceof Error ? error.message : 'Unknown error')
    }

    async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
        const res = await this.instance.get<T>(url, { params })
        return res.data
    }

    async post<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
        const res = await this.instance.post<T>(url, data, { params })
        return res.data
    }

    async put<T>(url: string, data?: unknown): Promise<T> {
        const res = await this.instance.put<T>(url, data)
        return res.data
    }

    async delete<T>(url: string): Promise<T> {
        const res = await this.instance.delete<T>(url)
        return res.data
    }
}

export const httpClient = new HttpClient()