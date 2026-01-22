// utils/__tests__/ruleTransform.test.ts
import { describe, it, expect } from 'vitest'
import { transformFormToPayload, transformPayloadToForm } from '@/utils/ruleTransform'
import type { CreateRulePayload } from '@/types/api'
import {
  createRuleFormData,
  createSearchInputFormData,
  createHttpInputFormData,
  createEmailActionFormData,
  createTelemetryActionFormData,
} from '@/test/mocks/factories'
import { INITIAL_TRANSFORM, INITIAL_CONDITION } from '@/pages/CreateRulePage/constants'

describe('ruleTransform', () => {
  // ===========================================================================
  // transformPayloadToForm - API -> Form (for editing existing rules)
  // ===========================================================================
  describe('transformPayloadToForm', () => {
    it('transforms basic payload fields correctly', () => {
      const payload: CreateRulePayload = {
        name: 'Test Rule',
        author: 'test@blizzard.com',
        regions: ['NA', 'EU', 'KR'],
        inputs: [],
        actions: [],
      }

      const formData = transformPayloadToForm(payload)

      expect(formData.name).toBe('Test Rule')
      expect(formData.authorEmail).toBe('test@blizzard.com')
      expect(formData.regions).toEqual(['NA', 'EU', 'KR'])
    })

    describe('schedule transformation', () => {
      it('sets default schedule when no schedule provided', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.scheduleType).toBe('default')
        expect(formData.scheduleValue).toBe('')
      })

      it('transforms interval schedule correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
          schedule: { interval: '5m' },
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.scheduleType).toBe('interval')
        expect(formData.scheduleValue).toBe('5m')
      })

      it('transforms cron schedule correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
          schedule: { cron: '0 */6 * * *' },
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.scheduleType).toBe('cron')
        expect(formData.scheduleValue).toBe('0 */6 * * *')
      })
    })

    describe('parameters transformation', () => {
      it('transforms parameters object to array', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
          parameters: {
            threshold: 100,
            enabled: true,
            name: 'test',
          },
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.parameters).toHaveLength(3)
        expect(formData.parameters).toContainEqual({ key: 'threshold', value: '100' })
        expect(formData.parameters).toContainEqual({ key: 'enabled', value: 'true' })
        expect(formData.parameters).toContainEqual({ key: 'name', value: 'test' })
      })

      it('stringifies nested object parameters', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
          parameters: {
            config: { nested: 'value', count: 42 },
          },
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.parameters).toHaveLength(1)
        expect(formData.parameters[0].key).toBe('config')
        expect(JSON.parse(formData.parameters[0].value)).toEqual({ nested: 'value', count: 42 })
      })

      it('returns empty array when no parameters', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.parameters).toEqual([])
      })
    })

    describe('input transformations', () => {
      it('transforms search input correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [
            {
              search: { size: 10, query: { match_all: {} } },
              index: 'my-index-*',
            },
          ],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.inputs).toHaveLength(1)
        expect(formData.inputs[0].type).toBe('search')
        const searchInput = formData.inputs[0] as {
          type: 'search'
          index: string
          searchBody: string
        }
        expect(searchInput.index).toBe('my-index-*')
        expect(JSON.parse(searchInput.searchBody)).toEqual({ size: 10, query: { match_all: {} } })
      })

      it('uses default index when not specified in search input', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [{ search: { query: {} } }],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        const searchInput = formData.inputs[0] as { type: 'search'; index: string }
        expect(searchInput.index).toBe('all-telemetry-v2-*')
      })

      it('transforms http GET input correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [
            {
              request: {
                url: 'https://api.example.com/data',
                method: 'GET',
                json: true,
              },
            },
          ],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.inputs[0].type).toBe('http')
        const httpInput = formData.inputs[0] as {
          type: 'http'
          url: string
          method: string
          isJson: boolean
        }
        expect(httpInput.url).toBe('https://api.example.com/data')
        expect(httpInput.method).toBe('GET')
        expect(httpInput.isJson).toBe(true)
      })

      it('transforms http POST input with JSON body', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [
            {
              request: {
                url: 'https://api.example.com/data',
                method: 'POST',
                json: true,
                body: { key: 'value' },
              },
            },
          ],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        const httpInput = formData.inputs[0] as { type: 'http'; body: string }
        expect(JSON.parse(httpInput.body)).toEqual({ key: 'value' })
      })

      it('transforms http POST input with string body', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [
            {
              request: {
                url: 'https://api.example.com/data',
                method: 'POST',
                body: 'plain text body',
              },
            },
          ],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        const httpInput = formData.inputs[0] as { type: 'http'; body: string }
        expect(httpInput.body).toBe('plain text body')
      })

      it('transforms static input correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [{ static: { key: 'value', count: 42 } }],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.inputs[0].type).toBe('static')
        const staticInput = formData.inputs[0] as { type: 'static'; json: string }
        expect(JSON.parse(staticInput.json)).toEqual({ key: 'value', count: 42 })
      })

      it('transforms metric input correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [
            {
              metric: {
                start_relative: { value: '15', unit: 'minutes' },
                metrics: [
                  {
                    name: 'cpu.usage',
                    tags: { env: ['prod'] },
                    group_by: [{ name: 'tag', tags: ['host'] }],
                    aggregators: [{ name: 'avg', sampling: { value: 1, unit: 'minutes' } }],
                  },
                ],
              },
            },
          ],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.inputs[0].type).toBe('metric')
        const metricInput = formData.inputs[0] as {
          type: 'metric'
          startValue: string
          startUnit: string
          metricName: string
          tags: string
          groupBy: string
          aggregators: string
        }
        expect(metricInput.startValue).toBe('15')
        expect(metricInput.startUnit).toBe('minutes')
        expect(metricInput.metricName).toBe('cpu.usage')
        expect(JSON.parse(metricInput.tags)).toEqual({ env: ['prod'] })
      })

      it('handles unknown input type as static', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          // @ts-expect-error - Testing unknown input type handling
          inputs: [{ unknownType: { data: 'value' } }],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.inputs[0].type).toBe('static')
      })
    })

    describe('action transformations', () => {
      it('transforms email action correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [
            {
              email: {
                to: 'recipient@test.com',
                bcc: 'hidden@test.com',
                subject: 'Alert!',
                body: '<p>Body</p>',
                format: 'html',
                templateType: 'handlebars',
              },
            },
          ],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.actions[0].type).toBe('email')
        const emailAction = formData.actions[0] as {
          type: 'email'
          to: string
          bcc: string
          subject: string
          body: string
          format: string
          templateType: string
        }
        expect(emailAction.to).toBe('recipient@test.com')
        expect(emailAction.bcc).toBe('hidden@test.com')
        expect(emailAction.subject).toBe('Alert!')
        expect(emailAction.body).toBe('<p>Body</p>')
        expect(emailAction.format).toBe('html')
        expect(emailAction.templateType).toBe('handlebars')
      })

      it('transforms email action with throttle', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [
            {
              email: {
                to: 'test@test.com',
                subject: 'Test',
                body: 'Body',
                format: 'text',
                templateType: 'text',
              },
              throttle: {
                key: '{{entity_key}}',
                duration: '1h',
              },
            },
          ],
        }

        const formData = transformPayloadToForm(payload)

        const emailAction = formData.actions[0] as { throttleKey: string; throttleDuration: string }
        expect(emailAction.throttleKey).toBe('{{entity_key}}')
        expect(emailAction.throttleDuration).toBe('1h')
      })

      it('transforms telemetry-alert action correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [
            {
              'telemetry-alert': {
                summary: 'Alert Summary',
                description: 'Alert Description',
                severity: 3,
                condition_id: 'COND-123',
                qualifier: 'prod',
                format: 'handlebars',
              },
            },
          ],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.actions[0].type).toBe('telemetry')
        const telemetryAction = formData.actions[0] as {
          type: 'telemetry'
          summary: string
          description: string
          severity: number
          conditionId: string
          qualifier: string
          format: string
        }
        expect(telemetryAction.summary).toBe('Alert Summary')
        expect(telemetryAction.description).toBe('Alert Description')
        expect(telemetryAction.severity).toBe(3)
        expect(telemetryAction.conditionId).toBe('COND-123')
        expect(telemetryAction.qualifier).toBe('prod')
        expect(telemetryAction.format).toBe('handlebars')
      })

      it('transforms toggle-watch action correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [
            {
              'toggle-watch': {
                id: 42,
                enable: false,
              },
            },
          ],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.actions[0].type).toBe('toggle')
        const toggleAction = formData.actions[0] as {
          type: 'toggle'
          ruleId: string
          enable: boolean
        }
        expect(toggleAction.ruleId).toBe('42')
        expect(toggleAction.enable).toBe(false)
      })

      it('transforms http request action correctly', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [
            {
              request: {
                url: 'https://webhook.example.com',
                method: 'POST',
                json: true,
                body: { alert: true },
              },
            },
          ],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.actions[0].type).toBe('http')
        const httpAction = formData.actions[0] as {
          type: 'http'
          url: string
          method: string
          isJson: boolean
          body: string
        }
        expect(httpAction.url).toBe('https://webhook.example.com')
        expect(httpAction.method).toBe('POST')
        expect(httpAction.isJson).toBe(true)
        expect(JSON.parse(httpAction.body)).toEqual({ alert: true })
      })

      it('handles unknown action type as http', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          // @ts-expect-error - Testing unknown action type handling
          actions: [{ unknownAction: { data: 'value' } }],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.actions[0].type).toBe('http')
      })
    })

    describe('transform and condition code', () => {
      it('uses provided transform code', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
          transform: 'return data.map(x => x * 2);',
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.transformCode).toBe('return data.map(x => x * 2);')
      })

      it('uses INITIAL_TRANSFORM when transform not provided', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.transformCode).toBe(INITIAL_TRANSFORM)
      })

      it('uses provided condition code', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
          condition: 'return data.count > 100;',
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.conditionCode).toBe('return data.count > 100;')
      })

      it('uses INITIAL_CONDITION when condition not provided', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.conditionCode).toBe(INITIAL_CONDITION)
      })
    })

    describe('edge cases', () => {
      it('handles empty inputs and actions arrays', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: [],
          inputs: [],
          actions: [],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.inputs).toEqual([])
        expect(formData.actions).toEqual([])
        expect(formData.regions).toEqual([])
      })

      it('handles undefined inputs and actions', () => {
        const payload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
        } as CreateRulePayload

        const formData = transformPayloadToForm(payload)

        expect(formData.inputs).toEqual([])
        expect(formData.actions).toEqual([])
      })

      it('handles multiple inputs and actions', () => {
        const payload: CreateRulePayload = {
          name: 'Rule',
          author: 'test@test.com',
          regions: ['DEV'],
          inputs: [{ search: { query: {} }, index: 'index-1' }, { static: { key: 'value' } }],
          actions: [
            {
              email: {
                to: 'a@a.com',
                subject: 'S',
                body: 'B',
                format: 'text',
                templateType: 'text',
              },
            },
            { 'toggle-watch': { id: 1, enable: true } },
          ],
        }

        const formData = transformPayloadToForm(payload)

        expect(formData.inputs).toHaveLength(2)
        expect(formData.actions).toHaveLength(2)
      })
    })
  })

  // ===========================================================================
  // Round-trip tests (Form -> Payload -> Form)
  // ===========================================================================
  describe('round-trip transformations', () => {
    it('preserves basic rule data through round-trip', () => {
      const original = createRuleFormData({
        name: 'Round Trip Rule',
        authorEmail: 'roundtrip@test.com',
        regions: ['NA', 'EU'],
        scheduleType: 'interval',
        scheduleValue: '10m',
      })

      const payload = transformFormToPayload(original)
      const result = transformPayloadToForm(payload)

      expect(result.name).toBe(original.name)
      expect(result.authorEmail).toBe(original.authorEmail)
      expect(result.regions).toEqual(original.regions)
      expect(result.scheduleType).toBe(original.scheduleType)
      expect(result.scheduleValue).toBe(original.scheduleValue)
    })

    it('preserves search input through round-trip', () => {
      const original = createRuleFormData({
        inputs: [
          createSearchInputFormData({
            index: 'test-index-*',
            searchBody: JSON.stringify({ size: 5, query: { term: { status: 'error' } } }),
          }),
        ],
      })

      const payload = transformFormToPayload(original)
      const result = transformPayloadToForm(payload)

      expect(result.inputs[0].type).toBe('search')
      const resultInput = result.inputs[0] as { index: string; searchBody: string }
      expect(resultInput.index).toBe('test-index-*')
      expect(JSON.parse(resultInput.searchBody)).toEqual({
        size: 5,
        query: { term: { status: 'error' } },
      })
    })

    it('preserves email action through round-trip', () => {
      const original = createRuleFormData({
        actions: [
          createEmailActionFormData({
            to: 'test@test.com',
            bcc: 'bcc@test.com',
            subject: 'Subject',
            body: 'Body',
            format: 'html',
            templateType: 'handlebars',
            throttleKey: '{{key}}',
            throttleDuration: '30m',
          }),
        ],
      })

      const payload = transformFormToPayload(original)
      const result = transformPayloadToForm(payload)

      const resultAction = result.actions[0] as {
        to: string
        bcc: string
        subject: string
        throttleKey: string
        throttleDuration: string
      }
      expect(resultAction.to).toBe('test@test.com')
      expect(resultAction.bcc).toBe('bcc@test.com')
      expect(resultAction.throttleKey).toBe('{{key}}')
      expect(resultAction.throttleDuration).toBe('30m')
    })
  })

  // ===========================================================================
  // transformFormToPayload - Form -> API (for creating/updating rules)
  // ===========================================================================
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
