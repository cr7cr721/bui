// services/groups.service.ts
import { httpClient } from './http-client'

export interface GroupData {
  fullname: string
  ad_group: string
  public: boolean
}

interface GroupPayload extends GroupData {
  id: number | null
  adGroupExists: null
  adGroupError: boolean
  validating: boolean
}

const buildGroupPayload = (data: GroupData, id: number | null = null): GroupPayload => ({
  id,
  fullname: data.fullname,
  ad_group: data.ad_group,
  public: data.public,
  adGroupExists: null,
  adGroupError: false,
  validating: false,
})

export const groupsService = {
  create: (data: GroupData) => httpClient.post<void>('/groups', buildGroupPayload(data)),

  update: (groupId: number, data: GroupData) =>
    httpClient.put<void>(`/groups/${groupId}`, buildGroupPayload(data, groupId)),
}
