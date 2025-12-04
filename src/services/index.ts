// services/index.ts
export { httpClient, setAuthHelpers } from './http-client'
export { authService } from './auth.service'
export { rulesService } from './rules.service'
export { groupsService } from './groups.service'
export { regionsService } from './regions.service'

export type { LoginCredentials, LoginResponse } from './auth.service'
export type { GroupData } from './groups.service'
