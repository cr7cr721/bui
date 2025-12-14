import { IconMail, IconBell, IconPower, IconWorld } from '@tabler/icons-react'

export const ACTION_TYPES = [
  { value: 'email', label: 'Email Action', icon: IconMail, color: 'blue' },
  { value: 'telemetry', label: 'Telemetry Alert', icon: IconBell, color: 'orange' },
  { value: 'toggle', label: 'Toggle Rule', icon: IconPower, color: 'green' },
  { value: 'http', label: 'HTTP Request', icon: IconWorld, color: 'violet' },
] as const

export interface ActionEditorProps {
  index: number
}
