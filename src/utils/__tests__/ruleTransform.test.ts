// utils/__tests__/ruleTransform.test.ts
import { describe, it, expect } from 'vitest'
import { transformFormToPayload } from '@/utils/ruleTransform'
import {
  createRuleFormData,
  createSearchInputFormData,
  createHttpInputFormData,
  createEmailActionFormData,
  createTelemetryActionFormData,
} from '@/test/mocks/factories'

describe('ruleTransform', () => {
  describe('transformFormToPayload', () => {
    it('transforms basic form data correctly', () => {
      const formData = createRuleFormData({
        name: 'Test Rule',
        authorEmail: 'test@blizzard.com',
        regions: ['NA', 'EU'],
      })

      const payload = transformFormToPayload(formData)

      expect(payload.name).toBe('Test Rule')
      expect(payload.author).toBe('test@blizzard.com')
      expect(payload.regions).toEqual(['NA', 'EU'])
    })

    it('excludes schedule when using default', () => {
      const formData = createRuleFormData({
        scheduleType: 'default',
        scheduleValue: '',
      })

      const payload = transformFormToPayload(formData)

      expect(payload.schedule).toBeUndefined()
    })

    it('includes interval schedule when specified', () => {
      const formData = createRuleFormData({
        scheduleType: 'interval',
        scheduleValue: '5m',
      })

      const payload = transformFormToPayload(formData)

      expect(payload.schedule).toEqual({ interval: '5m' })
    })

    it('includes cron schedule when specified', () => {
      const formData = createRuleFormData({
        scheduleType: 'cron',
        scheduleValue: '0 * * * *',
      })

      const payload = transformFormToPayload(formData)

      expect(payload.schedule).toEqual({ cron: '0 * * * *' })
    })

    it('transforms parameters with JSON parsing', () => {
      const formData = createRuleFormData({
        parameters: [
          { key: 'threshold', value: '100' },
          { key: 'enabled', value: 'true' },
          { key: 'config', value: '{"nested": "value"}' },
          { key: 'text', value: 'plain string' },
        ],
      })

      const payload = transformFormToPayload(formData)

      expect(payload.parameters).toEqual({
        threshold: 100,
        enabled: true,
        config: { nested: 'value' },
        text: 'plain string',
      })
    })

    it('excludes empty parameter keys', () => {
      const formData = createRuleFormData({
        parameters: [
          { key: '', value: 'ignored' },
          { key: 'valid', value: 'kept' },
        ],
      })

      const payload = transformFormToPayload(formData)

      expect(payload.parameters).toEqual({ valid: 'kept' })
    })

    it('excludes parameters section when empty', () => {
      const formData = createRuleFormData({ parameters: [] })

      const payload = transformFormToPayload(formData)

      expect(payload.parameters).toBeUndefined()
    })

    describe('input transformations', () => {
      it('transforms search input correctly', () => {
        const formData = createRuleFormData({
          inputs: [
            createSearchInputFormData({
              index: 'my-index-*',
              searchBody: JSON.stringify({ size: 10, query: { match_all: {} } }),
            }),
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.inputs).toHaveLength(1)
        expect(payload.inputs[0]).toEqual({
          search: { size: 10, query: { match_all: {} } },
          index: 'my-index-*',
        })
      })

      it('transforms http GET input correctly', () => {
        const formData = createRuleFormData({
          inputs: [
            createHttpInputFormData({
              url: 'https://api.example.com/data',
              method: 'GET',
              isJson: true,
              body: '',
            }),
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.inputs[0]).toEqual({
          request: {
            url: 'https://api.example.com/data',
            method: 'GET',
            json: true,
          },
        })
      })

      it('transforms http POST input with JSON body', () => {
        const formData = createRuleFormData({
          inputs: [
            createHttpInputFormData({
              url: 'https://api.example.com/data',
              method: 'POST',
              isJson: true,
              body: '{"key": "value"}',
            }),
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.inputs[0]).toEqual({
          request: {
            url: 'https://api.example.com/data',
            method: 'POST',
            json: true,
            body: { key: 'value' },
          },
        })
      })

      it('transforms http POST input with plain text body', () => {
        const formData = createRuleFormData({
          inputs: [
            createHttpInputFormData({
              url: 'https://api.example.com/data',
              method: 'POST',
              isJson: false,
              body: 'plain text body',
            }),
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.inputs[0]).toEqual({
          request: {
            url: 'https://api.example.com/data',
            method: 'POST',
            body: 'plain text body',
          },
        })
      })

      it('transforms static input correctly', () => {
        const formData = createRuleFormData({
          inputs: [
            {
              type: 'static' as const,
              json: '{"staticKey": "staticValue"}',
            },
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.inputs[0]).toEqual({
          static: { staticKey: 'staticValue' },
        })
      })

      it('transforms metric input correctly', () => {
        const formData = createRuleFormData({
          inputs: [
            {
              type: 'metric' as const,
              startValue: '10',
              startUnit: 'minutes' as const,
              metricName: 'my.metric.name',
              tags: '{"env": ["prod"]}',
              groupBy: '[{"name": "tag", "tags": ["host"]}]',
              aggregators: '[{"name": "avg", "sampling": {"value": 1, "unit": "minutes"}}]',
            },
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.inputs[0]).toEqual({
          metric: {
            start_relative: { value: '10', unit: 'minutes' },
            metrics: [
              {
                name: 'my.metric.name',
                tags: { env: ['prod'] },
                group_by: [{ name: 'tag', tags: ['host'] }],
                aggregators: [{ name: 'avg', sampling: { value: 1, unit: 'minutes' } }],
              },
            ],
          },
        })
      })
    })

    describe('action transformations', () => {
      it('transforms email action correctly', () => {
        const formData = createRuleFormData({
          actions: [
            createEmailActionFormData({
              to: 'recipient@test.com',
              bcc: 'hidden@test.com',
              subject: 'Alert Subject',
              body: '<p>Alert body</p>',
              format: 'html',
              templateType: 'handlebars',
              throttleKey: '',
              throttleDuration: '',
            }),
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.actions[0]).toEqual({
          email: {
            to: 'recipient@test.com',
            bcc: 'hidden@test.com',
            subject: 'Alert Subject',
            body: '<p>Alert body</p>',
            format: 'html',
            templateType: 'handlebars',
          },
        })
      })

      it('excludes bcc when empty', () => {
        const formData = createRuleFormData({
          actions: [
            createEmailActionFormData({
              to: 'recipient@test.com',
              bcc: '',
            }),
          ],
        })

        const payload = transformFormToPayload(formData)
        const emailAction = payload.actions[0] as { email: { bcc?: string } }

        expect(emailAction.email.bcc).toBeUndefined()
      })

      it('includes throttle config when specified', () => {
        const formData = createRuleFormData({
          actions: [
            createEmailActionFormData({
              throttleKey: '{{entity_key}}',
              throttleDuration: '1h',
            }),
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.actions[0]).toMatchObject({
          throttle: {
            key: '{{entity_key}}',
            duration: '1h',
          },
        })
      })

      it('transforms telemetry action correctly', () => {
        const formData = createRuleFormData({
          actions: [
            createTelemetryActionFormData({
              summary: 'Alert Summary',
              description: 'Detailed description',
              severity: 3,
              conditionId: 'COND-123',
              qualifier: 'prod',
              format: 'handlebars',
            }),
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.actions[0]).toMatchObject({
          'telemetry-alert': {
            summary: 'Alert Summary',
            description: 'Detailed description',
            severity: 3,
            condition_id: 'COND-123',
            qualifier: 'prod',
            format: 'handlebars',
          },
        })
      })

      it('transforms toggle action correctly', () => {
        const formData = createRuleFormData({
          actions: [
            {
              type: 'toggle' as const,
              ruleId: '42',
              enable: false,
              throttleKey: '',
              throttleDuration: '',
            },
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.actions[0]).toEqual({
          'toggle-watch': {
            id: '42',
            enable: false,
          },
        })
      })

      it('handles toggle action with id 0', () => {
        const formData = createRuleFormData({
          actions: [
            {
              type: 'toggle' as const,
              ruleId: '0',
              enable: true,
              throttleKey: '',
              throttleDuration: '',
            },
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.actions[0]).toEqual({
          'toggle-watch': {
            id: 0,
            enable: true,
          },
        })
      })

      it('transforms http action correctly', () => {
        const formData = createRuleFormData({
          actions: [
            {
              type: 'http' as const,
              url: 'https://webhook.example.com',
              method: 'POST' as const,
              isJson: true,
              body: '{"alert": true}',
              throttleKey: '',
              throttleDuration: '',
            },
          ],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.actions[0]).toEqual({
          request: {
            url: 'https://webhook.example.com',
            method: 'POST',
            json: true,
            body: { alert: true },
          },
        })
      })
    })

    describe('transform and condition code', () => {
      it('includes transform code when provided', () => {
        const formData = createRuleFormData({
          transformCode: 'return data.map(x => x * 2);',
        })

        const payload = transformFormToPayload(formData)

        expect(payload.transform).toBe('return data.map(x => x * 2);')
      })

      it('excludes transform code when it contains default placeholder', () => {
        const formData = createRuleFormData({
          transformCode: '// Write your transform code here\n// return transformed data',
        })

        const payload = transformFormToPayload(formData)

        expect(payload.transform).toBeUndefined()
      })

      it('includes condition code when provided', () => {
        const formData = createRuleFormData({
          conditionCode: 'return data.count > 100;',
        })

        const payload = transformFormToPayload(formData)

        expect(payload.condition).toBe('return data.count > 100;')
      })

      it('excludes condition code when it contains default placeholder', () => {
        const formData = createRuleFormData({
          conditionCode: '// Write your condition code here\n// return true/false',
        })

        const payload = transformFormToPayload(formData)

        expect(payload.condition).toBeUndefined()
      })
    })

    describe('edge cases', () => {
      it('handles empty inputs array', () => {
        const formData = createRuleFormData({ inputs: [] })

        const payload = transformFormToPayload(formData)

        expect(payload.inputs).toEqual([])
      })

      it('handles empty actions array', () => {
        const formData = createRuleFormData({ actions: [] })

        const payload = transformFormToPayload(formData)

        expect(payload.actions).toEqual([])
      })

      it('handles multiple inputs and actions', () => {
        const formData = createRuleFormData({
          inputs: [createSearchInputFormData(), createHttpInputFormData()],
          actions: [createEmailActionFormData(), createTelemetryActionFormData()],
        })

        const payload = transformFormToPayload(formData)

        expect(payload.inputs).toHaveLength(2)
        expect(payload.actions).toHaveLength(2)
      })
    })
  })
})
