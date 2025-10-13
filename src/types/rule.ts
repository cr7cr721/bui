export interface RuleFormData {
    // Info & Schedule
    name: string
    authorEmail: string
    regions: string[]
    scheduleType: 'default' | 'interval' | 'cron'
    scheduleValue?: string

    // Parameters
    parameters: Array<{ key: string; value: string }>
    parametersJson?: string

    // Inputs
    inputs: Array<{
        type: 'search' | 'http' | 'static' | 'metric'
        config: Record<string, any>
    }>

    // Transform
    transformCode: string

    // Condition
    conditionCode: string

    // Actions
    actions: Array<{
        type: 'email' | 'telemetry' | 'toggle' | 'http'
        config: Record<string, any>
    }>
}