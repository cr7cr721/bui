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

export interface RuleResponse {
  id: number
  version: number
  body: CreateRulePayload
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
// Rule Creation / Editing
// =============================================================================

export interface CreateRulePayload {
  name: string
  author: string
  regions: string[]
  schedule?: {
    interval?: string
    cron?: string
  }
  parameters?: Record<string, unknown>
  inputs: RuleInput[]
  transform?: string
  condition?: string
  actions: RuleAction[]
}

// Input types
export type RuleInput =
  | { search: SearchQuery; index?: string }
  | { request: HttpRequest }
  | { static: Record<string, unknown> }
  | { metric: MetricQuery }

export interface SearchQuery {
  size?: number
  query: Record<string, unknown>
  aggs?: Record<string, unknown>
}

export interface HttpRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT'
  json?: boolean
  body?: string | Record<string, unknown>
}

export interface MetricQuery {
  start_relative: {
    value: string
    unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  }
  metrics: Array<{
    name: string
    tags?: Record<string, string[]>
    group_by?: Array<{ name: string; tags: string[] }>
    aggregators?: Array<{
      name: string
      sampling?: { value: number; unit: string }
    }>
  }>
}

// Action types
export type RuleAction =
  | { email: EmailAction; throttle?: ThrottleConfig }
  | { 'telemetry-alert': TelemetryAlertAction; throttle?: ThrottleConfig }
  | { 'toggle-watch': ToggleWatchAction; throttle?: ThrottleConfig }
  | { request: HttpRequest; throttle?: ThrottleConfig }

export interface EmailAction {
  to: string
  bcc?: string
  subject: string
  body: string
  format: 'text' | 'html' | 'markdown'
  templateType: 'text' | 'handlebars'
}

export interface TelemetryAlertAction {
  summary: string
  description: string
  severity: 1 | 2 | 3 | 4 | 5
  condition_id?: string
  qualifier?: string
  format?: 'text' | 'handlebars'
}

export interface ToggleWatchAction {
  id: string | number
  enable: boolean
}

export interface ThrottleConfig {
  key?: string
  duration?: string
}

// =============================================================================
// Regions
// =============================================================================

export interface Region {
  name: string
  description: string
}
