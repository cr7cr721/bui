import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { User, Region, Rule } from '@/types/api'

// const BASE_URL = "https://beam-dev-dev.blizzardgdp.com/api"
const BASE_URL = 'https://gdp-beam-api.dev.data.blz.dev'

interface LoginCredentials {
  user: string
  password: string
}

interface LoginResponse {
  token: string
}

// Import the store to access auth token
let getAuthToken: () => string | null = () => null
let clearAuthToken: () => void = () => {}

// This will be set after the store is created
export const setAuthHelpers = (getToken: () => string | null, clearToken: () => void) => {
  getAuthToken = getToken
  clearAuthToken = clearToken
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // withCredentials: true, // Include cookies for authentication if needed
      timeout: 10000, // 10 second timeout
    })

    // Request interceptor for logging and adding auth token
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)

        // Add auth token if available
        const token = getAuthToken()
        if (token) {
          config.headers['x-auth-token'] = token
        }

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
        if (error.response?.status === 401) {
          // Token expired or invalid, clear it from store
          clearAuthToken()
        }

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

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/user/login', credentials)
    return response.data
  }

  async getUser(): Promise<User> {
    const response = await this.client.get<User>('/user')
    return response.data
  }

  async getRegions(): Promise<Region[]> {
    const response = await this.client.get<Region[]>('/regions')
    return response.data
  }

  async getAuthors(groupId: number): Promise<string[]> {
    const response = await this.client.get<string[]>(`/rules/values/author?group=${groupId}`)
    return response.data
  }

  async getVersion(): Promise<string> {
    const response = await this.client.get<string>('/version')
    return response.data
  }

  async getRules(regions: string, groupId: number): Promise<Rule[]> {
    const response = await this.client.get<Rule[]>(`/rules?regions=${regions}&group=${groupId}`)
    return response.data
  }

  async moveRuleToGroup(ruleId: number, groupId: number): Promise<void> {
    await this.client.post(`/rules/${ruleId}/setgroup?group=${groupId}`)
  }

  async deleteRule(ruleId: number): Promise<void> {
    await this.client.post(`/rules/${ruleId}/delete`)
  }

  async createGroup(data: { fullname: string; ad_group: string; public: boolean }): Promise<void> {
    await this.client.post('/groups', {
      id: null,
      fullname: data.fullname,
      ad_group: data.ad_group,
      public: data.public,
      adGroupExists: null,
      adGroupError: false,
      validating: false,
    })
  }

  async updateGroup(
    groupId: number,
    data: {
      fullname: string
      ad_group: string
      public: boolean
    }
  ): Promise<void> {
    await this.client.put(`/groups/${groupId}`, {
      id: groupId,
      fullname: data.fullname,
      ad_group: data.ad_group,
      public: data.public,
      adGroupExists: null,
      adGroupError: false,
      validating: false,
    })
  }

  async getChromieRegions(): Promise<string[]> {
    const response = await this.client.get<string[]>('/chromie/regions')
    return response.data
  }

  async getDisabledRegions(): Promise<string[]> {
    const response = await this.client.get<string[]>('/chromie/regions/disabled')
    return response.data
  }

  async enableRegion(region: string): Promise<void> {
    await this.client.post(`/chromie/regions/${region}/enable`)
  }

  async disableRegion(region: string): Promise<void> {
    await this.client.post(`/chromie/regions/${region}/disable`)
  }
}

export const apiClient = new ApiClient()
