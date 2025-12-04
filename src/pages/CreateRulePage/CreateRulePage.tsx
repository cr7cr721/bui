import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { Container, Paper, Stepper, Button, Group, Title, Tabs } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconForms, IconCode } from '@tabler/icons-react'

// Import step components
import { InfoScheduleStep } from './steps/InfoScheduleStep'
import { ParametersStep } from './steps/ParametersStep'
import { InputsStep } from './steps/InputsStep'
import { TransformStep } from './steps/TransformStep'
import { ConditionStep } from './steps/ConditionStep'
import { ActionsStep } from './steps/ActionsStep'
import { JsonView } from './JsonView'

import type { RuleFormData } from '@/types/rule'

const CreateRulePage = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [activeView, setActiveView] = useState<'form' | 'json'>('form')

  const methods = useForm<RuleFormData>({
    defaultValues: {
      name: '',
      authorEmail: '',
      regions: [],
      scheduleType: 'default',
      parameters: [],
      inputs: [],
      transformCode: '// Write your transform code here\n',
      conditionCode: '// Write your condition code here\n',
      actions: [],
    },
    mode: 'onChange',
  })

  const nextStep = async () => {
    let fieldsToValidate: (keyof RuleFormData)[] = []

    // Validate current step fields
    switch (active) {
      case 0: // Info & Schedule
        fieldsToValidate = ['name', 'authorEmail', 'regions']
        break
      case 1: // Parameters
        fieldsToValidate = ['parameters']
        break
      case 2: // Inputs
        fieldsToValidate = ['inputs']
        break
      case 3: // Transform
        fieldsToValidate = ['transformCode']
        break
      case 4: // Condition
        fieldsToValidate = ['conditionCode']
        break
      case 5: // Actions
        fieldsToValidate = ['actions']
        break
    }

    const isValid = await methods.trigger(fieldsToValidate)

    if (isValid) {
      setActive((current) => (current < 6 ? current + 1 : current))
    }
  }

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

  const onSubmit = async (data: RuleFormData) => {
    try {
      console.log('Submitting rule:', data)
      // TODO: Call API to create rule
      // await apiClient.createRule(data)

      notifications.show({
        title: 'Success',
        message: 'Rule created successfully!',
        color: 'green',
        icon: <IconCheck size={16} />,
      })

      navigate('/')
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create rule',
        color: 'red',
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
                  <Paper p="md" withBorder mt="xl">
                    <Title order={4} mb="md">
                      Review & Submit
                    </Title>
                    <Button onClick={methods.handleSubmit(onSubmit)} size="lg">
                      Create Rule
                    </Button>
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
                  <Button onClick={active === 6 ? methods.handleSubmit(onSubmit) : nextStep}>
                    {active === 6 ? 'Submit' : 'Next'}
                  </Button>
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
    </Container>
  )
}

export default CreateRulePage
