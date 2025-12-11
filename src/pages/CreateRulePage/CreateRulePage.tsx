import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import {
  Container,
  Paper,
  Stepper,
  Button,
  Group,
  Title,
  Tabs,
  Modal,
  Select,
  Stack,
  Text,
  Switch,
  Alert,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconForms, IconCode, IconAlertCircle } from '@tabler/icons-react'

// Import step components
import { InfoScheduleStep } from './steps/InfoScheduleStep'
import { ParametersStep } from './steps/ParametersStep'
import { InputsStep } from './steps/InputsStep'
import { TransformStep } from './steps/TransformStep'
import { ConditionStep } from './steps/ConditionStep'
import { ActionsStep } from './steps/ActionsStep'
import { JsonView } from './JsonView'

import { useCreateRule, useUser } from '@/hooks/useApi'
import { transformFormToPayload } from '@/utils/ruleTransform'
import type { RuleFormData } from '@/types/rule'

const INITIAL_TRANSFORM = `// Transform function
// Receives: inputs, parameters, context
// Return transformed data for condition

function transform(inputs, parameters, context) {
  return inputs[0];
}
`

const INITIAL_CONDITION = `// Condition function
// Receives: transformed, parameters, context
// Return true to trigger actions

function condition(transformed, parameters, context) {
  return false;
}
`

const CreateRulePage = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [activeView, setActiveView] = useState<'form' | 'json'>('form')
  const [saveModalOpened, { open: openSaveModal, close: closeSaveModal }] = useDisclosure(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [disableAfterSave, setDisableAfterSave] = useState(false)

  const { data: user } = useUser()
  const createRuleMutation = useCreateRule()

  // Get groups user can write to
  const writableGroups =
    user?.groups?.filter((g) => g.write).map((g) => ({ value: String(g.id), label: g.fullname })) ||
    []

  const methods = useForm<RuleFormData>({
    defaultValues: {
      name: '',
      authorEmail: user?.email || '',
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

  const nextStep = async () => {
    let fieldsToValidate: (keyof RuleFormData)[] = []

    switch (active) {
      case 0:
        fieldsToValidate = ['name', 'authorEmail', 'regions']
        break
      case 1:
        fieldsToValidate = ['parameters']
        break
      case 2:
        fieldsToValidate = ['inputs']
        break
      case 3:
        fieldsToValidate = ['transformCode']
        break
      case 4:
        fieldsToValidate = ['conditionCode']
        break
      case 5:
        fieldsToValidate = ['actions']
        break
    }

    const isValid = await methods.trigger(fieldsToValidate)

    if (isValid) {
      setActive((current) => (current < 6 ? current + 1 : current))
    }
  }

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

  const handleSaveClick = () => {
    if (writableGroups.length === 1) {
      setSelectedGroupId(writableGroups[0].value)
    }
    openSaveModal()
  }

  const onSubmit = async (data: RuleFormData) => {
    if (!selectedGroupId) {
      notifications.show({
        title: 'Error',
        message: 'Please select a group',
        color: 'red',
      })
      return
    }

    try {
      const payload = transformFormToPayload(data)
      console.log('Submitting rule payload:', payload)

      await createRuleMutation.mutateAsync({
        groupId: parseInt(selectedGroupId),
        rule: payload,
      })

      closeSaveModal()

      const message = disableAfterSave
        ? 'Rule created! It will remain disabled until enabled by a user.'
        : 'Rule created! It should begin executing momentarily.'

      notifications.show({
        title: 'Success',
        message,
        color: 'green',
        icon: <IconCheck size={16} />,
      })

      // Navigate to the rules list
      navigate('/')
    } catch (error) {
      console.error('Failed to create rule:', error)
      notifications.show({
        title: 'Error',
        message:
          error instanceof Error ? error.message : 'Failed to create rule. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      })
    }
  }

  return (
    <Container size="xl">
      <Paper shadow="sm" p="xl" withBorder>
        <Title order={2} mb="xl">
          Create Rule
        </Title>

        <FormProvider {...methods}>
          <Tabs
            value={activeView}
            onChange={(val) => setActiveView(val as 'form' | 'json')}
            mb="xl"
          >
            <Tabs.List>
              <Tabs.Tab value="form" leftSection={<IconForms size={16} />}>
                Form View
              </Tabs.Tab>
              <Tabs.Tab value="json" leftSection={<IconCode size={16} />}>
                Raw JSON
              </Tabs.Tab>
            </Tabs.List>

            {/* Form View Panel */}
            <Tabs.Panel value="form" pt="xl">
              <Stepper active={active} onStepClick={setActive}>
                <Stepper.Step label="Info & Schedule" description="Basic information">
                  <InfoScheduleStep />
                </Stepper.Step>

                <Stepper.Step label="Parameters" description="Configure parameters">
                  <ParametersStep />
                </Stepper.Step>

                <Stepper.Step label="Inputs" description="Define inputs">
                  <InputsStep />
                </Stepper.Step>

                <Stepper.Step label="Transform" description="Transform data">
                  <TransformStep />
                </Stepper.Step>

                <Stepper.Step label="Condition" description="Set conditions">
                  <ConditionStep />
                </Stepper.Step>

                <Stepper.Step label="Actions" description="Define actions">
                  <ActionsStep />
                </Stepper.Step>

                <Stepper.Completed>
                  <Paper p="xl" withBorder mt="xl" bg="dark.7">
                    <Stack gap="md">
                      <Title order={4}>
                        <IconCheck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Ready to Save
                      </Title>
                      <Text c="dimmed">
                        Your rule configuration is complete. Review the JSON or click Save to create
                        your rule.
                      </Text>
                      <Group>
                        <Button
                          variant="light"
                          onClick={() => setActiveView('json')}
                          leftSection={<IconCode size={16} />}
                        >
                          Review JSON
                        </Button>
                        <Button
                          onClick={handleSaveClick}
                          leftSection={<IconCheck size={16} />}
                          loading={createRuleMutation.isPending}
                        >
                          Save Rule
                        </Button>
                      </Group>
                    </Stack>
                  </Paper>
                </Stepper.Completed>
              </Stepper>

              <Group justify="space-between" mt="xl">
                <Button variant="default" onClick={prevStep} disabled={active === 0}>
                  Back
                </Button>
                <Group>
                  <Button
                    variant="light"
                    onClick={() => setActiveView('json')}
                    leftSection={<IconCode size={16} />}
                  >
                    View JSON
                  </Button>
                  {active === 6 ? (
                    <Button
                      onClick={handleSaveClick}
                      leftSection={<IconCheck size={16} />}
                      loading={createRuleMutation.isPending}
                    >
                      Save Rule
                    </Button>
                  ) : (
                    <Button onClick={nextStep}>Next</Button>
                  )}
                </Group>
              </Group>
            </Tabs.Panel>

            {/* JSON View Panel */}
            <Tabs.Panel value="json" pt="xl">
              <JsonView onBackToForm={() => setActiveView('form')} />
            </Tabs.Panel>
          </Tabs>
        </FormProvider>
      </Paper>

      {/* Save Modal */}
      <Modal opened={saveModalOpened} onClose={closeSaveModal} title="Save Rule" centered>
        <Stack gap="md">
          <Select
            label="Select BEAM Group"
            placeholder="Choose a group"
            data={writableGroups}
            value={selectedGroupId}
            onChange={setSelectedGroupId}
            required
            description="The rule will be saved to this group"
          />

          <Switch
            label="Disable rule after saving"
            description="The rule won't execute until manually enabled"
            checked={disableAfterSave}
            onChange={(e) => setDisableAfterSave(e.currentTarget.checked)}
          />

          {writableGroups.length === 0 && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              You don't have write access to any groups. Contact an admin to get access.
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeSaveModal}>
              Cancel
            </Button>
            <Button
              onClick={methods.handleSubmit(onSubmit)}
              loading={createRuleMutation.isPending}
              disabled={!selectedGroupId}
            >
              Create Rule
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}

export default CreateRulePage
