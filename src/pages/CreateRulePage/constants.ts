import type { RuleFormData } from '@/types/rule'

export const INITIAL_TRANSFORM = `// Transform function
// Receives: inputs, parameters, context
// Return transformed data for condition

function transform(inputs, parameters, context) {
  return inputs[0];
}
`

export const INITIAL_CONDITION = `// Condition function
// Receives: transformed, parameters, context
// Return true to trigger actions

function condition(transformed, parameters, context) {
  return false;
}
`

export const STEP_FIELDS: Record<number, (keyof RuleFormData)[]> = {
  0: ['name', 'authorEmail', 'regions'],
  1: ['parameters'],
  2: ['inputs'],
  3: ['transformCode'],
  4: ['conditionCode'],
  5: ['actions'],
}

export const STEPS = [
  { label: 'Info & Schedule', description: 'Basic information' },
  { label: 'Parameters', description: 'Configure parameters' },
  { label: 'Inputs', description: 'Define inputs' },
  { label: 'Transform', description: 'Transform data' },
  { label: 'Condition', description: 'Set conditions' },
  { label: 'Actions', description: 'Define actions' },
] as const
