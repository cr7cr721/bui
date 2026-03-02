// utils/ruleTransform.ts
// Transforms RuleFormData to CreateRulePayload for API submission
// And reverse: CreateRulePayload to RuleFormData for editing

import type { CreateRulePayload, RuleInput, RuleAction, ThrottleConfig } from '@/types/api'
import type {
  RuleFormData,
  InputFormData,
  ActionFormData,
  SearchInputFormData,
  HttpInputFormData,
  StaticInputFormData,
  MetricInputFormData,
  EmailActionFormData,
  TelemetryActionFormData,
  ToggleActionFormData,
  HttpActionFormData,
} from '@/types/rule'
import { INITIAL_TRANSFORM, INITIAL_CONDITION } from '@/pages/CreateRulePage/constants'

// =============================================================================
// API Payload -> Form Data (for editing existing rules)
// =============================================================================

/**
 * Transform CreateRulePayload from API to RuleFormData for form editing
 */
export const transformPayloadToForm = (payload: CreateRulePayload): RuleFormData => {
  // Determine schedule type
  let scheduleType: 'default' | 'interval' | 'cron' = 'default'
  let scheduleValue = ''
  if (payload.schedule?.interval) {
    scheduleType = 'interval'
    scheduleValue = payload.schedule.interval
  } else if (payload.schedule?.cron) {
    scheduleType = 'cron'
    scheduleValue = payload.schedule.cron
  }

  // Transform parameters
  const parameters = payload.parameters
    ? Object.entries(payload.parameters).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
      }))
    : []

  return {
    name: payload.name,
    authorEmail: payload.author,
    regions: payload.regions || [],
    scheduleType,
    scheduleValue,
    parameters,
    inputs: (payload.inputs || []).map(reverseTransformInput),
    transformCode: payload.transform || INITIAL_TRANSFORM,
    conditionCode: payload.condition || INITIAL_CONDITION,
    actions: (payload.actions || []).map(reverseTransformAction),
    esUpgraded: !!(payload as Record<string, unknown>).es_upgraded,
  }
}

/**
 * Reverse transform a single input from API format to form data
 */
const reverseTransformInput = (input: RuleInput): InputFormData => {
  if ('search' in input) {
    return reverseTransformSearchInput(input as { search: unknown; index?: string })
  }
  if ('request' in input) {
    return reverseTransformHttpInput(
      input as { request: { url: string; method: string; json?: boolean; body?: unknown } }
    )
  }
  if ('static' in input) {
    return reverseTransformStaticInput(input as { static: Record<string, unknown> })
  }
  if ('metric' in input) {
    return reverseTransformMetricInput(
      input as {
        metric: {
          start_relative: { value: string; unit: string }
          metrics: Array<{
            name?: string
            tags?: unknown
            group_by?: unknown
            aggregators?: unknown
          }>
        }
      }
    )
  }
  // Default to static if unknown
  return {
    type: 'static',
    json: JSON.stringify(input, null, 2),
  }
}

const reverseTransformSearchInput = (input: {
  search: unknown
  index?: string
}): SearchInputFormData => ({
  type: 'search',
  index: input.index || 'all-telemetry-v2-*',
  searchBody: JSON.stringify(input.search, null, 2),
})

const reverseTransformHttpInput = (input: {
  request: { url: string; method: string; json?: boolean; body?: unknown }
}): HttpInputFormData => ({
  type: 'http',
  url: input.request.url || '',
  method: (input.request.method as 'GET' | 'POST' | 'PUT') || 'GET',
  isJson: input.request.json ?? true,
  body: input.request.body
    ? typeof input.request.body === 'string'
      ? input.request.body
      : JSON.stringify(input.request.body, null, 2)
    : '',
})

const reverseTransformStaticInput = (input: {
  static: Record<string, unknown>
}): StaticInputFormData => ({
  type: 'static',
  json: JSON.stringify(input.static, null, 2),
})

const reverseTransformMetricInput = (input: {
  metric: {
    start_relative: { value: string; unit: string }
    metrics: Array<{ name?: string; tags?: unknown; group_by?: unknown; aggregators?: unknown }>
  }
}): MetricInputFormData => {
  const metric = input.metric.metrics?.[0] || {}
  return {
    type: 'metric',
    startValue: input.metric.start_relative?.value || '10',
    startUnit: (input.metric.start_relative?.unit as MetricInputFormData['startUnit']) || 'minutes',
    metricName: metric.name || '',
    tags: metric.tags ? JSON.stringify(metric.tags) : '{}',
    groupBy: metric.group_by ? JSON.stringify(metric.group_by) : '[]',
    aggregators: metric.aggregators ? JSON.stringify(metric.aggregators) : '[]',
  }
}

/**
 * Reverse transform a single action from API format to form data
 */
const reverseTransformAction = (action: RuleAction): ActionFormData => {
  const throttle = (action as { throttle?: ThrottleConfig }).throttle
  const ifScript = (action as { if?: string }).if

  if ('email' in action) {
    return reverseTransformEmailAction(
      action as {
        email: {
          to: string
          bcc?: string
          subject: string
          body: string
          format: string
          templateType: string
        }
        throttle?: ThrottleConfig
        if?: string
      }
    )
  }
  if ('telemetry-alert' in action) {
    return reverseTransformTelemetryAction(
      action as {
        'telemetry-alert': {
          summary: string
          description: string
          severity: number
          condition_id?: string
          qualifier?: string
          format?: string
        }
        throttle?: ThrottleConfig
        if?: string
      }
    )
  }
  if ('toggle-watch' in action) {
    return reverseTransformToggleAction(
      action as {
        'toggle-watch': { id: string | number; enable: boolean }
        throttle?: ThrottleConfig
        if?: string
      }
    )
  }
  if ('request' in action) {
    return reverseTransformHttpAction(
      action as {
        request: { url: string; method: string; json?: boolean; body?: unknown }
        throttle?: ThrottleConfig
        if?: string
      }
    )
  }
  // Default to HTTP action
  return {
    type: 'http',
    url: '',
    method: 'POST',
    isJson: true,
    body: JSON.stringify(action, null, 2),
    throttleKey: throttle?.key || '',
    throttleDuration: throttle?.duration || '',
    ifCondition: ifScript || '',
  }
}

const reverseTransformEmailAction = (action: {
  email: {
    to: string
    bcc?: string
    subject: string
    body: string
    format: string
    templateType: string
  }
  throttle?: ThrottleConfig
  if?: string
}): EmailActionFormData => ({
  type: 'email',
  to: action.email.to || '',
  bcc: action.email.bcc || '',
  subject: action.email.subject || '',
  body: action.email.body || '',
  format: (action.email.format as 'text' | 'html' | 'markdown') || 'html',
  templateType: (action.email.templateType as 'text' | 'handlebars') || 'handlebars',
  throttleKey: action.throttle?.key || '',
  throttleDuration: action.throttle?.duration || '',
  ifCondition: action.if || '',
})

const reverseTransformTelemetryAction = (action: {
  'telemetry-alert': {
    summary: string
    description: string
    severity: number
    condition_id?: string
    qualifier?: string
    format?: string
  }
  throttle?: ThrottleConfig
  if?: string
}): TelemetryActionFormData => ({
  type: 'telemetry',
  summary: action['telemetry-alert'].summary || '',
  description: action['telemetry-alert'].description || '',
  severity: (action['telemetry-alert'].severity as 1 | 2 | 3 | 4 | 5) || 4,
  conditionId: action['telemetry-alert'].condition_id || '',
  qualifier: action['telemetry-alert'].qualifier || '',
  format: (action['telemetry-alert'].format as 'text' | 'handlebars') || 'handlebars',
  throttleKey: action.throttle?.key || '',
  throttleDuration: action.throttle?.duration || '',
  ifCondition: action.if || '',
})

const reverseTransformToggleAction = (action: {
  'toggle-watch': { id: string | number; enable: boolean }
  throttle?: ThrottleConfig
  if?: string
}): ToggleActionFormData => ({
  type: 'toggle',
  ruleId: String(action['toggle-watch'].id || ''),
  enable: action['toggle-watch'].enable ?? true,
  throttleKey: action.throttle?.key || '',
  throttleDuration: action.throttle?.duration || '',
  ifCondition: action.if || '',
})

const reverseTransformHttpAction = (action: {
  request: { url: string; method: string; json?: boolean; body?: unknown }
  throttle?: ThrottleConfig
  if?: string
}): HttpActionFormData => ({
  type: 'http',
  url: action.request.url || '',
  method: (action.request.method as 'GET' | 'POST' | 'PUT') || 'POST',
  isJson: action.request.json ?? true,
  body: action.request.body
    ? typeof action.request.body === 'string'
      ? action.request.body
      : JSON.stringify(action.request.body, null, 2)
    : '',
  throttleKey: action.throttle?.key || '',
  throttleDuration: action.throttle?.duration || '',
  ifCondition: action.if || '',
})

// =============================================================================
// Form Data -> API Payload (for creating/updating rules)
// =============================================================================

/**
 * Transform RuleFormData from the form to CreateRulePayload for the API
 */
export const transformFormToPayload = (formData: RuleFormData): CreateRulePayload => {
  const payload: CreateRulePayload = {
    name: formData.name,
    author: formData.authorEmail,
    regions: formData.regions,
    inputs: formData.inputs.map(transformInput),
    actions: formData.actions.map(transformAction),
  }

  // Add schedule if not default
  if (formData.scheduleType !== 'default' && formData.scheduleValue) {
    payload.schedule = {
      [formData.scheduleType]: formData.scheduleValue,
    }
  }

  // Add parameters if any
  if (formData.parameters.length > 0) {
    payload.parameters = formData.parameters.reduce(
      (acc, param) => {
        if (param.key) {
          // Try to parse value as JSON, otherwise use as string
          try {
            acc[param.key] = JSON.parse(param.value)
          } catch {
            acc[param.key] = param.value
          }
        }
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  // Add transform if not empty/default
  const transformCode = formData.transformCode.trim()
  if (transformCode && !transformCode.startsWith('// Write your transform')) {
    payload.transform = transformCode
  }

  // Add condition if not empty/default
  const conditionCode = formData.conditionCode.trim()
  if (conditionCode && !conditionCode.startsWith('// Write your condition')) {
    payload.condition = conditionCode
  }

  // Add es_upgraded flag if set
  if (formData.esUpgraded) {
    ;(payload as Record<string, unknown>).es_upgraded = true
  }

  return payload
}

/**
 * Transform a single input from form data to API format
 */
const transformInput = (input: InputFormData): RuleInput => {
  switch (input.type) {
    case 'search':
      return transformSearchInput(input)
    case 'http':
      return transformHttpInput(input)
    case 'static':
      return transformStaticInput(input)
    case 'metric':
      return transformMetricInput(input)
    default:
      throw new Error(`Unknown input type: ${(input as InputFormData).type}`)
  }
}

const transformSearchInput = (input: SearchInputFormData): RuleInput => {
  const result: RuleInput = {
    search: JSON.parse(input.searchBody || '{}'),
  }
  if (input.index) {
    ;(result as { search: unknown; index?: string }).index = input.index
  }
  return result
}

const transformHttpInput = (input: HttpInputFormData): RuleInput => {
  const request: { url: string; method: string; json?: boolean; body?: unknown } = {
    url: input.url,
    method: input.method,
  }

  if (input.isJson) {
    request.json = true
  }

  if (input.method !== 'GET' && input.body) {
    if (input.isJson) {
      try {
        request.body = JSON.parse(input.body)
      } catch {
        request.body = input.body
      }
    } else {
      request.body = input.body
    }
  }

  return { request } as RuleInput
}

const transformStaticInput = (input: StaticInputFormData): RuleInput => ({
  static: JSON.parse(input.json || '{}'),
})

const transformMetricInput = (input: MetricInputFormData): RuleInput => {
  const metric = {
    start_relative: {
      value: input.startValue,
      unit: input.startUnit,
    },
    metrics: [
      {
        name: input.metricName,
        ...(input.tags && input.tags !== '{}' ? { tags: JSON.parse(input.tags) } : {}),
        ...(input.groupBy && input.groupBy !== '[]' ? { group_by: JSON.parse(input.groupBy) } : {}),
        ...(input.aggregators && input.aggregators !== '[]'
          ? { aggregators: JSON.parse(input.aggregators) }
          : {}),
      },
    ],
  }

  return { metric } as RuleInput
}

/**
 * Transform a single action from form data to API format
 */
const transformAction = (action: ActionFormData): RuleAction => {
  switch (action.type) {
    case 'email':
      return transformEmailAction(action)
    case 'telemetry':
      return transformTelemetryAction(action)
    case 'toggle':
      return transformToggleAction(action)
    case 'http':
      return transformHttpAction(action)
    default:
      throw new Error(`Unknown action type: ${(action as ActionFormData).type}`)
  }
}

const transformEmailAction = (action: EmailActionFormData): RuleAction => {
  const result: RuleAction = {
    email: {
      to: action.to,
      subject: action.subject,
      body: action.body,
      format: action.format,
      templateType: action.templateType,
      ...(action.bcc ? { bcc: action.bcc } : {}),
    },
  }

  if (action.throttleKey || action.throttleDuration) {
    result.throttle = {}
    if (action.throttleKey) result.throttle.key = action.throttleKey
    if (action.throttleDuration) result.throttle.duration = action.throttleDuration
  }

  if (action.ifCondition) {
    ;(result as Record<string, unknown>).if = action.ifCondition
  }

  return result
}

const transformTelemetryAction = (action: TelemetryActionFormData): RuleAction => {
  const result: RuleAction = {
    'telemetry-alert': {
      summary: action.summary,
      description: action.description,
      severity: action.severity,
      ...(action.conditionId ? { condition_id: action.conditionId } : {}),
      ...(action.qualifier ? { qualifier: action.qualifier } : {}),
      ...(action.format ? { format: action.format } : {}),
    },
  }

  if (action.throttleKey || action.throttleDuration) {
    result.throttle = {}
    if (action.throttleKey) result.throttle.key = action.throttleKey
    if (action.throttleDuration) result.throttle.duration = action.throttleDuration
  }

  if (action.ifCondition) {
    ;(result as Record<string, unknown>).if = action.ifCondition
  }

  return result
}

const transformToggleAction = (action: ToggleActionFormData): RuleAction => {
  const result: RuleAction = {
    'toggle-watch': {
      id: action.ruleId === '0' ? 0 : action.ruleId,
      enable: action.enable,
    },
  }

  if (action.throttleKey || action.throttleDuration) {
    result.throttle = {}
    if (action.throttleKey) result.throttle.key = action.throttleKey
    if (action.throttleDuration) result.throttle.duration = action.throttleDuration
  }

  if (action.ifCondition) {
    ;(result as Record<string, unknown>).if = action.ifCondition
  }

  return result
}

const transformHttpAction = (action: HttpActionFormData): RuleAction => {
  const request: { url: string; method: string; json?: boolean; body?: unknown } = {
    url: action.url,
    method: action.method,
  }

  if (action.isJson) {
    request.json = true
  }

  if (action.method !== 'GET' && action.body) {
    if (action.isJson) {
      try {
        request.body = JSON.parse(action.body)
      } catch {
        request.body = action.body
      }
    } else {
      request.body = action.body
    }
  }

  const result: RuleAction = { request } as RuleAction

  if (action.throttleKey || action.throttleDuration) {
    result.throttle = {}
    if (action.throttleKey) result.throttle.key = action.throttleKey
    if (action.throttleDuration) result.throttle.duration = action.throttleDuration
  }

  if (action.ifCondition) {
    ;(result as Record<string, unknown>).if = action.ifCondition
  }

  return result
}
