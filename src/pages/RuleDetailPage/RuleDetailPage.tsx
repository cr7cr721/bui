import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Container,
  Paper,
  Title,
  Tabs,
  Stepper,
  LoadingOverlay,
  Alert,
  Group,
  Badge,
  Button,
  Anchor,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconForms, IconCode, IconAlertCircle, IconArrowLeft, IconCheck } from '@tabler/icons-react'

import { useRule, useUpdateRule, useUser } from '@/hooks/useApi'
import { transformPayloadToForm, transformFormToPayload } from '@/utils/ruleTransform'
import type { RuleFormData } from '@/types/rule'
import { STEPS, INITIAL_TRANSFORM, INITIAL_CONDITION } from '@/pages/CreateRulePage/constants'
import { StepNavigation, JsonView } from '@/pages/CreateRulePage/components'
import {
  InfoScheduleStep,
  ParametersStep,
  InputsStep,
  TransformStep,
  ConditionStep,
  ActionsStep,
} from '@/pages/CreateRulePage/steps'

const STEP_COMPONENTS = [
  InfoScheduleStep,
  ParametersStep,
  InputsStep,
  TransformStep,
  ConditionStep,
  ActionsStep,
]

export const RuleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const ruleId = parseInt(id || '0')

  const { data: ruleData, isLoading, error } = useRule(ruleId)
  const { data: user } = useUser()
  const updateRuleMutation = useUpdateRule()

  const [view, setView] = useState<'form' | 'json'>('form')
  const [activeStep, setActiveStep] = useState(0)

  // Initialize form with default values
  const methods = useForm<RuleFormData>({
    defaultValues: {
      name: '',
      authorEmail: '',
      regions: [],
      scheduleType: 'default',
      scheduleValue: '',
      parameters: [],
      inputs: [],
      transformCode: INITIAL_TRANSFORM,
      conditionCode: INITIAL_CONDITION,
      actions: [],
    },
    mode: 'onChange',
  })

  // Transform API data to form data when rule loads
  const formData = useMemo(() => {
    if (ruleData?.body) {
      return transformPayloadToForm(ruleData.body)
    }
    return null
  }, [ruleData])

  // Reset form when rule data loads
  useEffect(() => {
    if (formData) {
      methods.reset(formData)
    }
  }, [formData, methods])

  // Check if user can edit this rule
  const canEdit = useMemo(() => {
    if (!user?.groups) return false
    // User can edit if they have write access to any group
    return user.groups.some((g) => g.write)
  }, [user])

  const nextStep = () => {
    setActiveStep((s) => Math.min(s + 1, 5))
  }

  const prevStep = () => {
    setActiveStep((s) => Math.max(s - 1, 0))
  }

  const handleSave = async () => {
    const data = methods.getValues()
    try {
      const payload = transformFormToPayload(data)
      await updateRuleMutation.mutateAsync({
        ruleId,
        rule: payload,
      })

      notifications.show({
        title: 'Success',
        message: 'Rule updated successfully!',
        color: 'green',
        icon: <IconCheck size={16} />,
      })
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to update rule.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      })
    }
  }

  const StepComponent = STEP_COMPONENTS[activeStep]

  if (isLoading) {
    return (
      <Container size="xl">
        <Paper shadow="sm" p="xl" withBorder pos="relative" mih={400}>
          <LoadingOverlay visible={true} />
        </Paper>
      </Container>
    )
  }

  if (error || !ruleData) {
    return (
      <Container size="xl">
        <Paper shadow="sm" p="xl" withBorder>
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" variant="light">
            {error?.message || 'Rule not found'}
          </Alert>
          <Button
            component={Link}
            to="/"
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            mt="md"
          >
            Back to Rules List
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="xl">
      <Paper shadow="sm" p="xl" withBorder>
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <div>
            <Anchor
              component={Link}
              to="/"
              size="sm"
              c="dimmed"
              mb="xs"
              style={{ display: 'block' }}
            >
              <Group gap={4}>
                <IconArrowLeft size={14} />
                Back to Rules List
              </Group>
            </Anchor>
            <Group gap="md" align="center">
              <Title order={2}>{ruleData.body.name}</Title>
              <Badge color="blue" variant="light" size="lg">
                ID: {ruleData.id}
              </Badge>
              {ruleData.version && (
                <Badge color="gray" variant="light" size="lg">
                  v{ruleData.version}
                </Badge>
              )}
            </Group>
          </div>
          {canEdit && (
            <Button
              onClick={handleSave}
              loading={updateRuleMutation.isPending}
              leftSection={<IconCheck size={16} />}
            >
              Save Changes
            </Button>
          )}
        </Group>

        {!canEdit && (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light" mb="xl">
            You don't have write access to edit this rule. Viewing in read-only mode.
          </Alert>
        )}

        <FormProvider {...methods}>
          <Tabs value={view} onChange={(v) => setView(v as 'form' | 'json')} mb="xl">
            <Tabs.List>
              <Tabs.Tab value="form" leftSection={<IconForms size={16} />}>
                Form View
              </Tabs.Tab>
              <Tabs.Tab value="json" leftSection={<IconCode size={16} />}>
                Raw JSON
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="form" pt="xl">
              <Stepper active={activeStep} onStepClick={setActiveStep}>
                {STEPS.map((step, i) => (
                  <Stepper.Step key={i} label={step.label} description={step.description}>
                    {StepComponent && <StepComponent />}
                  </Stepper.Step>
                ))}
              </Stepper>

              <StepNavigation
                onBack={prevStep}
                onNext={nextStep}
                onViewJson={() => setView('json')}
                onSave={handleSave}
                isFirstStep={activeStep === 0}
                isLastStep={activeStep === 5}
                isSubmitting={updateRuleMutation.isPending}
              />
            </Tabs.Panel>

            <Tabs.Panel value="json" pt="xl">
              <JsonView onBackToForm={() => setView('form')} />
            </Tabs.Panel>
          </Tabs>
        </FormProvider>
      </Paper>
    </Container>
  )
}
