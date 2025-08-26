import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { User, Region, Rule } from "../types/api"

// const BASE_URL = "https://beam-dev-dev.blizzardgdp.com/api"
const BASE_URL = "https://gdp-beam-api.dev.data.blz.dev"
// const BASE_URL = "/"

class ApiClient {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Include cookies for authentication if needed
            timeout: 10000, // 10 second timeout
        })

        // Request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
                return config
            },
            (error) => {
                return Promise.reject(error)
            }
        )

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                return response
            },
            (error) => {
                if (error.response) {
                    // Server responded with error status
                    throw new Error(`API Error: ${error.response.status} ${error.response.statusText}`)
                } else if (error.request) {
                    // Request was made but no response received
                    throw new Error('Network Error: No response from server')
                } else {
                    // Something else happened
                    throw new Error(`Request Error: ${error.message}`)
                }
            }
        )
    }

    async getUser(): Promise<User> {
        const response = await this.client.get<User>("/user")
        return response.data
    }

    async getRegions(): Promise<Region[]> {
        const response = await this.client.get<Region[]>("/regions")
        return response.data
    }

    async getAuthors(groupId: number): Promise<string[]> {
        const response = await this.client.get<string[]>(`/rules/values/author?group=${groupId}`)
        return response.data
    }

    async getVersion(): Promise<string> {
        const response = await this.client.get<string>("/version")
        return response.data
    }

    async getRules(regions: string, groupId: number): Promise<Rule[]> {
        const response = await this.client.get<Rule[]>(`/rules?regions=${regions}&group=${groupId}`)
        return response.data
    }
}

export const apiClient = new ApiClient()
