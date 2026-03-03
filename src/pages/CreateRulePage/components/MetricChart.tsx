import { useState, useMemo } from 'react'
import { Paper, Group, Text, Select, Button, Loader, Stack, Alert, Badge } from '@mantine/core'
import { IconRefresh, IconChartLine } from '@tabler/icons-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useRulePreview } from '@/pages/CreateRulePage/useRulePreview.ts'

const CHART_COLORS = [
  '#4dabf7',
  '#69db7c',
  '#ffd43b',
  '#ff6b6b',
  '#cc5de8',
  '#20c997',
  '#ff922b',
  '#845ef7',
  '#f06595',
  '#22b8cf',
]

interface MetricTimeSeries {
  name: string
  timestamps: number[]
  values: number[]
}
interface MetricRegionResult {
  region: string
  series: MetricTimeSeries[]
}

function extractSeriesFromPreview(inputData: unknown[]): MetricRegionResult[] {
  if (!inputData || !Array.isArray(inputData) || inputData.length === 0) return []
  return inputData.map((regionResult: unknown) => {
    const r = regionResult as {
      region?: string
      queries?: Array<{
        results?: Array<{
          name?: string
          tags?: Record<string, string[]>
          group_by?: Array<{ name: string; tags?: string[]; group?: Record<string, unknown> }>
          values?: Array<[number, number]>
        }>
      }>
    }
    const series: MetricTimeSeries[] = []
    if (r.queries) {
      r.queries.forEach((q, qi) => {
        if (q.results) {
          q.results.forEach((result) => {
            let name = result.name || 'metric'
            if (qi > 0) name += '#' + String(qi + 1)
            const suffixes: string[] = []
            if (result.group_by) {
              result.group_by.forEach((g) => {
                if (g.name === 'tag' && g.tags && result.tags) {
                  g.tags.forEach((tagName) => {
                    if (result.tags?.[tagName]) {
                      suffixes.push(tagName + '=' + result.tags[tagName][0])
                    }
                  })
                } else if (g.group) {
                  suffixes.push(
                    g.name +
                      ':' +
                      String(
                        (g.group as Record<string, unknown>).group_number ??
                          (g.group as Record<string, unknown>).bin_number ??
                          ''
                      )
                  )
                }
              })
            }
            if (suffixes.length > 0) name += ' - ' + suffixes.join(' ')
            const timestamps: number[] = []
            const values: number[] = []
            if (result.values) {
              result.values.forEach(([ts, val]) => {
                timestamps.push(ts)
                values.push(val)
              })
            }
            if (timestamps.length > 0) {
              series.push({ name, timestamps, values })
            }
          })
        }
      })
    }
    return { region: r.region || 'default', series }
  })
}

function toRechartsData(
  regionData: MetricRegionResult,
  selectedSeries: string
): { data: Array<Record<string, unknown>>; seriesNames: string[] } {
  if (!regionData || regionData.series.length === 0) return { data: [], seriesNames: [] }
  const filteredSeries =
    selectedSeries === '*'
      ? regionData.series.slice(0, 5)
      : regionData.series.filter((s) => s.name === selectedSeries)
  const tsSet = new Set<number>()
  filteredSeries.forEach((s) => s.timestamps.forEach((t) => tsSet.add(t)))
  const allTimestamps = Array.from(tsSet).sort((a, b) => a - b)
  const data = allTimestamps.map((ts) => {
    const row: Record<string, unknown> = { timestamp: ts }
    filteredSeries.forEach((s) => {
      const idx = s.timestamps.indexOf(ts)
      if (idx >= 0) row[s.name] = s.values[idx]
    })
    return row
  })
  return { data, seriesNames: filteredSeries.map((s) => s.name) }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

interface MetricChartProps {
  inputIndex: number
}

export const MetricChart = ({ inputIndex }: MetricChartProps) => {
  const { result, isRunning, error, run, hasCachedData } = useRulePreview({
    stopStep: 'inputs-execute',
    autoRun: true,
    debounceMs: 1200,
  })
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedSeries, setSelectedSeries] = useState<string>('*')

  const regionResults = useMemo(() => {
    if (!result?.ctx?.inputs) return []
    const inputPreview = (result.ctx.inputs as unknown[])[inputIndex]
    if (!inputPreview || !Array.isArray(inputPreview)) return []
    return extractSeriesFromPreview(inputPreview)
  }, [result, inputIndex])

  const activeRegion = useMemo(() => {
    if (selectedRegion && regionResults.some((r) => r.region === selectedRegion))
      return selectedRegion
    return regionResults.length > 0 ? regionResults[0].region : ''
  }, [regionResults, selectedRegion])

  const currentRegionData = useMemo(
    () => regionResults.find((r) => r.region === activeRegion) || null,
    [regionResults, activeRegion]
  )
  const { data: chartData, seriesNames } = useMemo(
    () =>
      currentRegionData
        ? toRechartsData(currentRegionData, selectedSeries)
        : { data: [], seriesNames: [] },
    [currentRegionData, selectedSeries]
  )
  const allSeriesNames = useMemo(
    () => currentRegionData?.series.map((s) => s.name) || [],
    [currentRegionData]
  )

  return (
    <Paper withBorder p="md" mt="md" bg="dark.7">
      <Group justify="space-between" mb="sm" wrap="wrap">
        <Group gap="xs">
          <IconChartLine size={16} />
          <Text size="sm" fw={500}>
            Metric Preview
          </Text>
          {chartData.length > 0 && !isRunning && (
            <Badge size="xs" variant="dot" color="green">
              Live
            </Badge>
          )}
          {isRunning && (
            <Badge size="xs" variant="dot" color="yellow">
              {hasCachedData ? 'Updating' : 'Loading'}
            </Badge>
          )}
        </Group>
        <Group gap="sm">
          {regionResults.length > 0 && (
            <>
              <Select
                size="xs"
                w={140}
                data={regionResults.map((r) => ({ value: r.region, label: r.region }))}
                value={activeRegion}
                onChange={(v) => {
                  setSelectedRegion(v || '')
                  setSelectedSeries('*')
                }}
              />
              <Select
                size="xs"
                w={200}
                data={[
                  { value: '*', label: 'All Timeseries' },
                  ...allSeriesNames.map((n) => ({ value: n, label: n })),
                ]}
                value={selectedSeries}
                onChange={(v) => setSelectedSeries(v || '*')}
              />
            </>
          )}
          <Button
            size="xs"
            variant="light"
            color="teal"
            leftSection={isRunning ? <Loader size={12} /> : <IconRefresh size={12} />}
            onClick={run}
            disabled={isRunning}
          >
            {isRunning ? 'Loading...' : 'Refresh'}
          </Button>
        </Group>
      </Group>
      {error && (
        <Alert color="red" variant="light" mb="sm" p="xs">
          <Text size="xs">{error.message || 'Query failed'}</Text>
        </Alert>
      )}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="rgba(255,255,255,0.4)"
              tick={{ fontSize: 11 }}
            />
            <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1b1e',
                border: '1px solid #373A40',
                borderRadius: 4,
                fontSize: 12,
              }}
              labelFormatter={(label) => formatTime(Number(label))}
            />
            {seriesNames.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {seriesNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : isRunning ? (
        <Stack align="center" justify="center" h={100}>
          <Loader size="sm" />
          <Text size="xs" c="dimmed">
            Loading metric data...
          </Text>
        </Stack>
      ) : (
        <Stack align="center" justify="center" h={100}>
          <Loader size="xs" color="dimmed" />
          <Text size="xs" c="dimmed" ta="center">
            Initializing metric preview...
          </Text>
        </Stack>
      )}
    </Paper>
  )
}
