import { IconSearch, IconWorld, IconCode, IconChartLine } from '@tabler/icons-react'

export const INPUT_TYPES = [
  { value: 'search', label: 'Search Input', icon: IconSearch, color: 'blue' },
  { value: 'http', label: 'HTTP Input', icon: IconWorld, color: 'green' },
  { value: 'static', label: 'Static Input', icon: IconCode, color: 'orange' },
  { value: 'metric', label: 'Metric Input', icon: IconChartLine, color: 'violet' },
] as const

export interface InputEditorProps {
  index: number
}
