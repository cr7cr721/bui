// services/regions.service.ts
import { httpClient } from './http-client'
import type { Region } from '@/types/api'

export const regionsService = {
    getAll: () =>
        httpClient.get<Region[]>('/regions'),

    getChromieRegions: () =>
        httpClient.get<string[]>('/chromie/regions'),

    getDisabled: () =>
        httpClient.get<string[]>('/chromie/regions/disabled'),

    enable: (region: string) =>
        httpClient.post<void>(`/chromie/regions/${region}/enable`),

    disable: (region: string) =>
        httpClient.post<void>(`/chromie/regions/${region}/disable`),

    toggle: (region: string, enable: boolean) =>
        enable ? regionsService.enable(region) : regionsService.disable(region),
}