import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'
import { createElement } from 'react'

import { useCreateRule, useUser } from '@/hooks/useApi'
import { transformFormToPayload } from '@/utils/ruleTransform'
import type { RuleFormData } from '@/types/rule'
import { INITIAL_TRANSFORM, INITIAL_CONDITION, STEP_FIELDS } from './constants'

export const useRuleForm = () => {
  const navigate = useNavigate()
  const { data: user } = useUser()
  const createRuleMutation = useCreateRule()

  const [activeStep, setActiveStep] = useState(0)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [disableAfterSave, setDisableAfterSave] = useState(false)

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

  const writableGroups =
    user?.groups?.filter((g) => g.write).map((g) => ({ value: String(g.id), label: g.fullname })) ||
    []

  const nextStep = async () => {
    const fieldsToValidate = STEP_FIELDS[activeStep] || []
    const isValid = await methods.trigger(fieldsToValidate)
    if (isValid) setActiveStep((s) => Math.min(s + 1, 6))
  }

  const prevStep = () => setActiveStep((s) => Math.max(s - 1, 0))

  const submitRule = async (data: RuleFormData) => {
    if (!selectedGroupId) {
      notifications.show({ title: 'Error', message: 'Please select a group', color: 'red' })
      return
    }

    try {
      const payload = transformFormToPayload(data)
      await createRuleMutation.mutateAsync({
        groupId: parseInt(selectedGroupId),
        rule: payload,
      })

      notifications.show({
        title: 'Success',
        message: disableAfterSave
          ? 'Rule created! It will remain disabled until enabled.'
          : 'Rule created! It should begin executing momentarily.',
        color: 'green',
        icon: createElement(IconCheck, { size: 16 }),
      })
      navigate('/')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create rule.',
        color: 'red',
        icon: createElement(IconAlertCircle, { size: 16 }),
      })
    }
  }

  return {
    methods,
    activeStep,
    setActiveStep,
    nextStep,
    prevStep,
    isFirstStep: activeStep === 0,
    isLastStep: activeStep === 6,
    writableGroups,
    selectedGroupId,
    setSelectedGroupId,
    disableAfterSave,
    setDisableAfterSave,
    submitRule,
    isSubmitting: createRuleMutation.isPending,
  }
}
