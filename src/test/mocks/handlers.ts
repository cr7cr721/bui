import { http, HttpResponse, delay } from 'msw'
import {
  testUser,
  testAdminUser,
  testRules,
  testRegions,
  testChromieRegions,
  testDisabledRegions,
  createRuleTriggers,
  createRule,
  createTestRuleHistory,
} from '@/test'

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

  http.get(`${BASE}/rules/:ruleId`, async ({ params, request }) => {
    await delay(50)
    const ruleId = Number(params.ruleId)
    const url = new URL(request.url)
    const version = url.searchParams.get('version')

    const rule = testRules.find((r) => r.id === ruleId)
    if (!rule) {
      return HttpResponse.json({ message: 'Rule not found' }, { status: 404 })
    }

    // Base body structure
    const baseBody = {
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
    }

    // If a specific version is requested, modify the response slightly
    // to simulate version differences (for testing diff functionality)
    if (version) {
      const versionNum = Number(version)
      return HttpResponse.json({
        id: rule.id,
        version: versionNum,
        body: {
          ...baseBody,
          // Add version-specific changes for diff testing
          ...(versionNum < rule.version && {
            // Older version has different action
            actions: [
              {
                email: {
                  to: 'old@test.com',
                  subject: 'Old Test',
                  body: 'Old Body',
                  format: 'text',
                  templateType: 'text',
                },
              },
            ],
          }),
        },
      })
    }

    return HttpResponse.json({
      id: rule.id,
      version: rule.version,
      body: baseBody,
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

  http.get(`${BASE}/rules/:ruleId/history`, async ({ params }) => {
    await delay(50)
    const ruleId = Number(params.ruleId)
    return HttpResponse.json(createTestRuleHistory(ruleId))
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

  // Chromie Regions (Admin)
  http.get(`${BASE}/chromie/regions`, async () => {
    await delay(50)
    return HttpResponse.json(testChromieRegions)
  }),

  http.get(`${BASE}/chromie/regions/disabled`, async () => {
    await delay(50)
    return HttpResponse.json(testDisabledRegions)
  }),

  http.post(`${BASE}/chromie/regions/:region/enable`, async () => {
    await delay(50)
    return HttpResponse.json({})
  }),

  http.post(`${BASE}/chromie/regions/:region/disable`, async () => {
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

  userError: http.get(`${BASE}/user`, async () => {
    await delay(50)
    return HttpResponse.json({ message: 'Failed to load user' }, { status: 500 })
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

  chromieRegionsError: http.get(`${BASE}/chromie/regions`, async () => {
    await delay(50)
    return HttpResponse.json({ message: 'Failed to load regions' }, { status: 500 })
  }),

  toggleRegionError: http.post(`${BASE}/chromie/regions/:region/enable`, async () => {
    await delay(50)
    return HttpResponse.json({ message: 'Failed to toggle region' }, { status: 500 })
  }),

  ruleHistoryError: http.get(`${BASE}/rules/:ruleId/history`, async () => {
    await delay(50)
    return HttpResponse.json({ message: 'Failed to load history' }, { status: 500 })
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

// =============================================================================
// Admin Page Handlers
// =============================================================================

export const createAdminUserHandler = () =>
  http.get(`${BASE}/user`, async () => {
    await delay(50)
    return HttpResponse.json(testAdminUser)
  })

export const createChromieRegionsHandler = (regions: string[]) =>
  http.get(`${BASE}/chromie/regions`, async () => {
    await delay(50)
    return HttpResponse.json(regions)
  })

export const createDisabledRegionsHandler = (disabledRegions: string[]) =>
  http.get(`${BASE}/chromie/regions/disabled`, async () => {
    await delay(50)
    return HttpResponse.json(disabledRegions)
  })

// =============================================================================
// Groups Page Handlers
// =============================================================================

import type { Group } from '@/types/api'

export const createUserWithGroupsHandler = (groups: Group[]) =>
  http.get(`${BASE}/user`, async () => {
    await delay(50)
    return HttpResponse.json({ ...testUser, groups })
  })

export const createAdminWithGroupsHandler = (groups: Group[]) =>
  http.get(`${BASE}/user`, async () => {
    await delay(50)
    return HttpResponse.json({ ...testAdminUser, groups })
  })

export const createGroupsHandler = (groups: Group[]) =>
  http.get(`${BASE}/groups`, async () => {
    await delay(50)
    return HttpResponse.json(groups)
  })

export const createGroupSuccessHandler = () =>
  http.post(`${BASE}/groups`, async () => {
    await delay(50)
    return HttpResponse.json({
      id: 100,
      fullname: 'New Group',
      ad_group: 'AD-NEW',
      write: true,
      public: true,
    })
  })

export const updateGroupSuccessHandler = () =>
  http.post(`${BASE}/groups/:groupId`, async () => {
    await delay(50)
    return HttpResponse.json({})
  })

// =============================================================================
// Rule History Handlers
// =============================================================================

import type { RuleHistoryEntry } from '@/types/api'

export const createRuleHistoryHandler = (history: RuleHistoryEntry[]) =>
  http.get(`${BASE}/rules/:ruleId/history`, async () => {
    await delay(50)
    return HttpResponse.json(history)
  })

export const createEmptyHistoryHandler = () =>
  http.get(`${BASE}/rules/:ruleId/history`, async () => {
    await delay(50)
    return HttpResponse.json([])
  })
