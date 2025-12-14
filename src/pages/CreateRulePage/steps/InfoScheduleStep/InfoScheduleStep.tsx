import { Stack, TextInput, Checkbox, Radio, Group, Text } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import { useRegions } from '@/hooks/useApi'
import type { RuleFormData } from '@/types/rule'

export const InfoScheduleStep = () => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<RuleFormData>()
  const { data: regions } = useRegions()
  const scheduleType = watch('scheduleType')

  return (
    <Stack gap="lg" mt="xl">
      <TextInput
        label="Rule Name"
        placeholder="Enter rule name"
        withAsterisk
        error={errors.name?.message}
        {...register('name', { required: 'Rule name is required' })}
      />

      <TextInput
        label="Author's Email"
        placeholder="author@blizzard.com"
        withAsterisk
        error={errors.authorEmail?.message}
        {...register('authorEmail', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
      />

      <div>
        <Text size="sm" fw={500} mb="xs">
          Regions *
        </Text>
        <Group gap="lg">
          {regions?.map((region) => (
            <Controller
              key={region.name}
              name="regions"
              control={control}
              rules={{ required: 'Select at least one region' }}
              render={({ field }) => (
                <Checkbox
                  label={region.name}
                  checked={field.value?.includes(region.name)}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked
                    const newValue = checked
                      ? [...(field.value || []), region.name]
                      : field.value?.filter((r) => r !== region.name) || []
                    field.onChange(newValue)
                  }}
                />
              )}
            />
          ))}
        </Group>
        {errors.regions && (
          <Text size="sm" c="red" mt="xs">
            {errors.regions.message}
          </Text>
        )}
      </div>

      <div>
        <Text size="sm" fw={500} mb="xs">
          Schedule
        </Text>
        <Controller
          name="scheduleType"
          control={control}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Group mt="xs">
                <Radio value="default" label="Default (1m)" />
                <Radio value="interval" label="Interval" />
                <Radio value="cron" label="Cron" />
              </Group>
            </Radio.Group>
          )}
        />

        {(scheduleType === 'interval' || scheduleType === 'cron') && (
          <TextInput
            mt="md"
            label={scheduleType === 'interval' ? 'Interval (e.g., 5m, 1h)' : 'Cron Expression'}
            placeholder={scheduleType === 'interval' ? '5m' : '0 */5 * * * *'}
            description={
              scheduleType === 'interval'
                ? 'Duration format: 30s, 5m, 1h, etc.'
                : 'Standard cron expression (6 fields)'
            }
            {...register('scheduleValue', {
              required:
                scheduleType === 'interval' || scheduleType === 'cron'
                  ? 'Schedule value is required'
                  : false,
            })}
            error={errors.scheduleValue?.message}
          />
        )}
      </div>
    </Stack>
  )
}
