// =============================================================================
// User & Auth
// =============================================================================

export interface User {
  username: string
  user: string
  fullName: string
  firstName: string
  lastName: string
  email: string
  admin: boolean
  groups: Group[]
}

export interface Group {
  id: number
  fullname: string
  ad_group: string
  write: boolean
  public: boolean
}

export interface GroupFormData {
  fullname: string
  ad_group: string
  public: boolean
}

// =============================================================================
// Rules
// =============================================================================

export interface Rule {
  id: number
  name: string
  author: string
  group_id: number
  group_name: string
  regions: string[]
  enabled: number
  version: number
  trigger_count: number
  wake_time: string | null
  enabledIn: string[]
  unknownIn: string[]
  created: number
  updated: number
}

export interface RuleTrigger {
  rule_id: number
  entity_key: string
  region: string
  expires: number
}

export interface RuleFilters {
  region: string
  group: string
  author: string
  search: string
  enabled: 'all' | 'enabled' | 'disabled'
}

// =============================================================================
// Regions
// =============================================================================

export interface Region {
  name: string
  description: string
}
