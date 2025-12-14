import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { Container, Paper, Title, Tabs, Stepper } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconForms, IconCode } from '@tabler/icons-react'

import { useRuleForm } from './useRuleForm'
import { STEPS } from './constants'
import { SaveRuleModal, StepNavigation, CompletedStep, JsonView } from './components'
import {
  InfoScheduleStep,
  ParametersStep,
  InputsStep,
  TransformStep,
  ConditionStep,
  ActionsStep,
} from './steps'

const STEP_COMPONENTS = [
  InfoScheduleStep,
  ParametersStep,
  InputsStep,
  TransformStep,
  ConditionStep,
  ActionsStep,
]

const CreateRulePage = () => {
  const [view, setView] = useState<'form' | 'json'>('form')
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)

  const form = useRuleForm()

  const handleSave = () => {
    if (form.writableGroups.length === 1) {
      form.setSelectedGroupId(form.writableGroups[0].value)
    }
    openModal()
  }

  const handleConfirm = () => {
    form.methods.handleSubmit((data) => {
      form.submitRule(data)
      closeModal()
    })()
  }

  const StepComponent = STEP_COMPONENTS[form.activeStep]

  return (
    <Container size="xl">
      <Paper shadow="sm" p="xl" withBorder>
        <Title order={2} mb="xl">
          Create Rule
        </Title>

        <FormProvider {...form.methods}>
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
              <Stepper active={form.activeStep} onStepClick={form.setActiveStep}>
                {STEPS.map((step, i) => (
                  <Stepper.Step key={i} label={step.label} description={step.description}>
                    {StepComponent && <StepComponent />}
                  </Stepper.Step>
                ))}
                <Stepper.Completed>
                  <CompletedStep
                    onReviewJson={() => setView('json')}
                    onSave={handleSave}
                    isSubmitting={form.isSubmitting}
                  />
                </Stepper.Completed>
              </Stepper>

              <StepNavigation
                onBack={form.prevStep}
                onNext={form.nextStep}
                onViewJson={() => setView('json')}
                onSave={handleSave}
                isFirstStep={form.isFirstStep}
                isLastStep={form.isLastStep}
                isSubmitting={form.isSubmitting}
              />
            </Tabs.Panel>

            <Tabs.Panel value="json" pt="xl">
              <JsonView onBackToForm={() => setView('form')} />
            </Tabs.Panel>
          </Tabs>
        </FormProvider>
      </Paper>

      <SaveRuleModal
        opened={modalOpened}
        onClose={closeModal}
        onSave={handleConfirm}
        groups={form.writableGroups}
        selectedGroupId={form.selectedGroupId}
        onGroupChange={form.setSelectedGroupId}
        disableAfterSave={form.disableAfterSave}
        onDisableChange={form.setDisableAfterSave}
        isSubmitting={form.isSubmitting}
      />
    </Container>
  )
}

export default CreateRulePage
