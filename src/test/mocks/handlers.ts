import { http, HttpResponse, delay } from 'msw'
import { testUser, testRules, testRegions, createRuleTriggers, createRule } from './factories'

const BASE = 'https://gdp-beam-api.dev.data.blz.dev'

// =============================================================================
// Default Handlers - Happy Path
// =============================================================================

export const handlers = [
  // Auth
  http.post(`${BASE}/user/login`, async () => {
    await delay(50)
    return HttpResponse.json({ token: 'test-token-abc123' })
  }),

  http.get(`${BASE}/user`, async () => {
    await delay(50)
    return HttpResponse.json(testUser)
  }),

  // Rules
  http.get(`${BASE}/rules`, async () => {
    await delay(50)
    return HttpResponse.json(testRules)
  }),

  http.get(`${BASE}/rules/:ruleId`, async ({ params }) => {
    await delay(50)
    const ruleId = Number(params.ruleId)
    const rule = testRules.find((r) => r.id === ruleId)
    if (!rule) {
      return HttpResponse.json({ message: 'Rule not found' }, { status: 404 })
    }
    return HttpResponse.json({
      id: rule.id,
      version: rule.version,
      body: {
        name: rule.name,
        author: rule.author,
        regions: rule.regions,
        inputs: [{ search: { size: 0, query: {} }, index: 'all-telemetry-v2-*' }],
        actions: [
          {
            email: {
              to: 'test@test.com',
              subject: 'Test',
              body: 'Body',
              format: 'html',
              templateType: 'handlebars',
            },
          },
        ],
      },
    })
  }),

  http.post(`${BASE}/rules`, async () => {
    await delay(100)
    return HttpResponse.json({ id: 999 })
  }),

  http.post(`${BASE}/rules/:ruleId`, async () => {
    await delay(100)
    return HttpResponse.json({})
  }),

  http.post(`${BASE}/rules/:ruleId/enable/:region`, async () => {
    await delay(50)
    return HttpResponse.json({})
  }),

  http.post(`${BASE}/rules/:ruleId/disable/:region`, async () => {
    await delay(50)
    return HttpResponse.json({})
  }),

  http.post(`${BASE}/rules/:ruleId/delete`, async () => {
    await delay(50)
    return HttpResponse.json({})
  }),

  http.post(`${BASE}/rules/:ruleId/setgroup`, async () => {
    await delay(50)
    return HttpResponse.json({})
  }),

  http.get(`${BASE}/rules/:ruleId/triggers`, async ({ params }) => {
    await delay(50)
    const ruleId = Number(params.ruleId)
    const rule = testRules.find((r) => r.id === ruleId)
    if (!rule) return HttpResponse.json([])
    return HttpResponse.json(createRuleTriggers(rule.trigger_count, ruleId))
  }),

  http.get(`${BASE}/rules/values/author`, async () => {
    await delay(50)
    const authors = [...new Set(testRules.map((r) => r.author))]
    return HttpResponse.json(authors)
  }),

  http.post(`${BASE}/validate`, async () => {
    await delay(50)
    return HttpResponse.json({ valid: true, messages: [] })
  }),

  // Regions
  http.get(`${BASE}/regions`, async () => {
    await delay(50)
    return HttpResponse.json(testRegions)
  }),

  // Groups
  http.get(`${BASE}/groups`, async () => {
    await delay(50)
    return HttpResponse.json(testUser.groups)
  }),

  http.post(`${BASE}/groups`, async () => {
    await delay(100)
    return HttpResponse.json({
      id: 100,
      fullname: 'New Group',
      ad_group: 'AD-NEW',
      write: true,
      public: false,
    })
  }),

  http.post(`${BASE}/groups/:groupId`, async () => {
    await delay(100)
    return HttpResponse.json({})
  }),

  http.post(`${BASE}/groups/:groupId/delete`, async () => {
    await delay(50)
    return HttpResponse.json({})
  }),
]

// =============================================================================
// Error Handlers - For testing error states
// =============================================================================

export const errorHandlers = {
  loginFailure: http.post(`${BASE}/user/login`, async () => {
    await delay(50)
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  networkError: http.post(`${BASE}/user/login`, async () => {
    await delay(50)
    return HttpResponse.error()
  }),

  serverError: http.get(`${BASE}/rules`, async () => {
    await delay(50)
    return HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
  }),

  validationError: http.post(`${BASE}/validate`, async () => {
    await delay(50)
    return HttpResponse.json({
      valid: false,
      messages: ['Invalid rule configuration', 'Missing required field: name'],
    })
  }),

  ruleNotFound: http.get(`${BASE}/rules/:ruleId`, async () => {
    await delay(50)
    return HttpResponse.json({ message: 'Rule not found' }, { status: 404 })
  }),
}

// =============================================================================
// Dynamic Handlers - For specific test scenarios
// =============================================================================

export const createRulesHandler = (rules: typeof testRules) =>
  http.get(`${BASE}/rules`, async () => {
    await delay(50)
    return HttpResponse.json(rules)
  })

export const createUserHandler = (user: typeof testUser) =>
  http.get(`${BASE}/user`, async () => {
    await delay(50)
    return HttpResponse.json(user)
  })

export const createLoginHandler = (response: { token: string } | { error: string }, status = 200) =>
  http.post(`${BASE}/user/login`, async () => {
    await delay(50)
    return HttpResponse.json(response, { status })
  })

// Handler for empty rules list
export const emptyRulesHandler = http.get(`${BASE}/rules`, async () => {
  await delay(50)
  return HttpResponse.json([])
})

// Handler for many rules (pagination testing)
export const manyRulesHandler = (count: number) =>
  http.get(`${BASE}/rules`, async () => {
    await delay(50)
    return HttpResponse.json(Array.from({ length: count }, (_, i) => createRule({ id: i + 1 })))
  })
