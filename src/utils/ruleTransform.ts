// utils/ruleTransform.ts
// Transforms RuleFormData to CreateRulePayload for API submission

import type { CreateRulePayload, RuleInput, RuleAction } from '@/types/api'
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

/**
 * Transform RuleFormData from the form to CreateRulePayload for the API
 */
export function transformFormToPayload(formData: RuleFormData): CreateRulePayload {
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

  return payload
}

/**
 * Transform a single input from form data to API format
 */
function transformInput(input: InputFormData): RuleInput {
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

function transformSearchInput(input: SearchInputFormData): RuleInput {
  const result: RuleInput = {
    search: JSON.parse(input.searchBody || '{}'),
  }
  if (input.index) {
    ;(result as { search: unknown; index?: string }).index = input.index
  }
  return result
}

function transformHttpInput(input: HttpInputFormData): RuleInput {
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

function transformStaticInput(input: StaticInputFormData): RuleInput {
  return {
    static: JSON.parse(input.json || '{}'),
  }
}

function transformMetricInput(input: MetricInputFormData): RuleInput {
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
function transformAction(action: ActionFormData): RuleAction {
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

function transformEmailAction(action: EmailActionFormData): RuleAction {
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

  return result
}

function transformTelemetryAction(action: TelemetryActionFormData): RuleAction {
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

  return result
}

function transformToggleAction(action: ToggleActionFormData): RuleAction {
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

  return result
}

function transformHttpAction(action: HttpActionFormData): RuleAction {
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

  return result
}
