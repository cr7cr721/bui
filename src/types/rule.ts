// =============================================================================
// Rule Form Data Types
// =============================================================================

export interface RuleFormData {
  // Info & Schedule
  name: string
  authorEmail: string
  regions: string[]
  scheduleType: 'default' | 'interval' | 'cron'
  scheduleValue?: string

  // Parameters
  parameters: Array<{ key: string; value: string }>

  // Inputs
  inputs: InputFormData[]

  // Transform
  transformCode: string

  // Condition
  conditionCode: string

  // Actions
  actions: ActionFormData[]

  // Flags
  esUpgraded?: boolean
}

// =============================================================================
// Input Types
// =============================================================================

export type InputType = 'search' | 'http' | 'static' | 'metric'

export type InputFormData =
  | SearchInputFormData
  | HttpInputFormData
  | StaticInputFormData
  | MetricInputFormData

export interface SearchInputFormData {
  type: 'search'
  index: string
  searchBody: string // JSON string
}

export interface HttpInputFormData {
  type: 'http'
  url: string
  method: 'GET' | 'POST' | 'PUT'
  isJson: boolean
  body: string
}

export interface StaticInputFormData {
  type: 'static'
  json: string // JSON string
}

export interface MetricInputFormData {
  type: 'metric'
  programName: string // Chromie program name (e.g. "gdp_cost")
  startValue: string
  startUnit:
    | 'milliseconds'
    | 'seconds'
    | 'minutes'
    | 'hours'
    | 'days'
    | 'weeks'
    | 'months'
    | 'years'
  metricName: string
  tags: string // JSON string for complex tag config
  groupBy: string // JSON string
  aggregators: string // JSON string
}

// =============================================================================
// Action Types
// =============================================================================

export type ActionType = 'email' | 'telemetry' | 'toggle' | 'http'

export type ActionFormData =
  | EmailActionFormData
  | TelemetryActionFormData
  | ToggleActionFormData
  | HttpActionFormData

export interface EmailActionFormData {
  type: 'email'
  to: string
  bcc: string
  subject: string
  body: string
  format: 'text' | 'html' | 'markdown'
  templateType: 'text' | 'handlebars'
  throttleKey: string
  throttleDuration: string
  ifCondition?: string
}

export interface TelemetryActionFormData {
  type: 'telemetry'
  summary: string
  description: string
  severity: 1 | 2 | 3 | 4 | 5
  conditionId: string
  qualifier: string
  format: 'text' | 'handlebars'
  throttleKey: string
  throttleDuration: string
  ifCondition?: string
}

export interface ToggleActionFormData {
  type: 'toggle'
  ruleId: string
  enable: boolean
  throttleKey: string
  throttleDuration: string
  ifCondition?: string
}

export interface HttpActionFormData {
  type: 'http'
  url: string
  method: 'GET' | 'POST' | 'PUT'
  isJson: boolean
  body: string
  throttleKey: string
  throttleDuration: string
  ifCondition?: string
}

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_SEARCH_INPUT: SearchInputFormData = {
  type: 'search',
  index: 'all-telemetry-v2-*',
  searchBody: JSON.stringify(
    {
      size: 0,
      query: {},
    },
    null,
    2
  ),
}

export const DEFAULT_HTTP_INPUT: HttpInputFormData = {
  type: 'http',
  url: '',
  method: 'GET',
  isJson: true,
  body: '',
}

export const DEFAULT_STATIC_INPUT: StaticInputFormData = {
  type: 'static',
  json: JSON.stringify({}, null, 2),
}

export const DEFAULT_METRIC_INPUT: MetricInputFormData = {
  type: 'metric',
  programName: '',
  startValue: '10',
  startUnit: 'minutes',
  metricName: '',
  tags: '{}',
  groupBy: '[]',
  aggregators: '[]',
}

export const DEFAULT_EMAIL_ACTION: EmailActionFormData = {
  type: 'email',
  to: '',
  bcc: '',
  subject: '',
  body: '',
  format: 'html',
  templateType: 'handlebars',
  throttleKey: '',
  throttleDuration: '',
}

export const DEFAULT_TELEMETRY_ACTION: TelemetryActionFormData = {
  type: 'telemetry',
  summary: '',
  description: '',
  severity: 4,
  conditionId: '',
  qualifier: '',
  format: 'handlebars',
  throttleKey: '',
  throttleDuration: '',
}

export const DEFAULT_TOGGLE_ACTION: ToggleActionFormData = {
  type: 'toggle',
  ruleId: '',
  enable: true,
  throttleKey: '',
  throttleDuration: '',
}

export const DEFAULT_HTTP_ACTION: HttpActionFormData = {
  type: 'http',
  url: '',
  method: 'POST',
  isJson: true,
  body: '',
  throttleKey: '',
  throttleDuration: '',
}
