// test/mocks/factories.ts
// Type-safe mock data factories using Faker
import { faker } from '@faker-js/faker'
import type {
  User,
  Group,
  Rule,
  Region,
  RuleTrigger,
  CreateRulePayload,
  RuleHistoryEntry,
} from '@/types/api'
import type {
  RuleFormData,
  SearchInputFormData,
  HttpInputFormData,
  EmailActionFormData,
  TelemetryActionFormData,
} from '@/types/rule'

// =============================================================================
// Seed for reproducible tests
// =============================================================================

export const setTestSeed = (seed = 12345) => faker.seed(seed)

// =============================================================================
// Group Factory
// =============================================================================

export const createGroup = (overrides: Partial<Group> = {}): Group => ({
  id: faker.number.int({ min: 1, max: 1000 }),
  fullname: faker.company.name(),
  ad_group: `AD-${faker.string.alphanumeric(8).toUpperCase()}`,
  write: faker.datatype.boolean(),
  public: faker.datatype.boolean(),
  ...overrides,
})

export const createGroups = (count: number, overrides: Partial<Group> = {}): Group[] =>
  Array.from({ length: count }, () => createGroup(overrides))

// =============================================================================
// User Factory
// =============================================================================

export const createUser = (overrides: Partial<User> = {}): User => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`

  return {
    username,
    user: username,
    fullName: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    admin: faker.datatype.boolean(),
    groups: createGroups(faker.number.int({ min: 1, max: 5 })),
    ...overrides,
  }
}

// =============================================================================
// Region Factory
// =============================================================================

const REGION_NAMES = ['DEV', 'NA', 'EU', 'KR', 'CN', 'TW'] as const

export const createRegion = (overrides: Partial<Region> = {}): Region => ({
  name: faker.helpers.arrayElement(REGION_NAMES),
  description: faker.lorem.sentence(),
  ...overrides,
})

export const createRegions = (): Region[] =>
  REGION_NAMES.map((name) => ({
    name,
    description: `${name} gaming region`,
  }))

// =============================================================================
// Rule Factory
// =============================================================================

export const createRule = (overrides: Partial<Rule> = {}): Rule => {
  const created = faker.date.past().getTime() / 1000
  const updated =
    faker.date.between({ from: new Date(created * 1000), to: new Date() }).getTime() / 1000

  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    name: `${faker.word.adjective()}-${faker.word.noun()}-monitor`,
    author: faker.internet.email(),
    group_id: faker.number.int({ min: 1, max: 100 }),
    group_name: faker.company.name(),
    regions: faker.helpers.arrayElements(REGION_NAMES, { min: 1, max: 3 }),
    enabled: faker.number.int({ min: 0, max: 1 }),
    version: faker.number.int({ min: 1, max: 50 }),
    trigger_count: faker.number.int({ min: 0, max: 10 }),
    wake_time: faker.datatype.boolean() ? faker.date.future().toISOString() : null,
    enabledIn: faker.helpers.arrayElements(REGION_NAMES, { min: 0, max: 3 }),
    unknownIn: [],
    created: Math.floor(created),
    updated: Math.floor(updated),
    ...overrides,
  }
}

export const createRules = (count: number, overrides: Partial<Rule> = {}): Rule[] =>
  Array.from({ length: count }, () => createRule(overrides))

// =============================================================================
// Rule Trigger Factory
// =============================================================================

export const createRuleTrigger = (overrides: Partial<RuleTrigger> = {}): RuleTrigger => ({
  rule_id: faker.number.int({ min: 1, max: 10000 }),
  entity_key: faker.string.uuid(),
  region: faker.helpers.arrayElement(REGION_NAMES),
  expires: Math.floor(faker.date.future().getTime() / 1000),
  ...overrides,
})

export const createRuleTriggers = (count: number, ruleId?: number): RuleTrigger[] =>
  Array.from({ length: count }, () => createRuleTrigger(ruleId ? { rule_id: ruleId } : {}))

// =============================================================================
// Create Rule Payload Factory
// =============================================================================

export const createRulePayload = (
  overrides: Partial<CreateRulePayload> = {}
): CreateRulePayload => ({
  name: `${faker.word.adjective()}-${faker.word.noun()}-rule`,
  author: faker.internet.email(),
  regions: faker.helpers.arrayElements(REGION_NAMES, { min: 1, max: 3 }),
  inputs: [
    {
      search: {
        size: 0,
        query: { match_all: {} },
      },
      index: 'all-telemetry-v2-*',
    },
  ],
  actions: [
    {
      email: {
        to: faker.internet.email(),
        subject: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        format: 'html',
        templateType: 'handlebars',
      },
    },
  ],
  ...overrides,
})

// =============================================================================
// Rule Form Data Factory
// =============================================================================

export const createSearchInputFormData = (
  overrides: Partial<SearchInputFormData> = {}
): SearchInputFormData => ({
  type: 'search',
  index: 'all-telemetry-v2-*',
  searchBody: JSON.stringify({ size: 0, query: {} }, null, 2),
  ...overrides,
})

export const createHttpInputFormData = (
  overrides: Partial<HttpInputFormData> = {}
): HttpInputFormData => ({
  type: 'http',
  url: faker.internet.url(),
  method: 'GET',
  isJson: true,
  body: '',
  ...overrides,
})

export const createEmailActionFormData = (
  overrides: Partial<EmailActionFormData> = {}
): EmailActionFormData => ({
  type: 'email',
  to: faker.internet.email(),
  bcc: '',
  subject: faker.lorem.sentence(),
  body: faker.lorem.paragraph(),
  format: 'html',
  templateType: 'handlebars',
  throttleKey: '',
  throttleDuration: '',
  ...overrides,
})

export const createTelemetryActionFormData = (
  overrides: Partial<TelemetryActionFormData> = {}
): TelemetryActionFormData => ({
  type: 'telemetry',
  summary: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  severity: faker.helpers.arrayElement([1, 2, 3, 4, 5] as const),
  conditionId: '',
  qualifier: '',
  format: 'handlebars',
  throttleKey: '',
  throttleDuration: '',
  ...overrides,
})

export const createRuleFormData = (overrides: Partial<RuleFormData> = {}): RuleFormData => ({
  name: `${faker.word.adjective()}-${faker.word.noun()}-rule`,
  authorEmail: faker.internet.email(),
  regions: faker.helpers.arrayElements(REGION_NAMES, { min: 1, max: 3 }),
  scheduleType: 'default',
  scheduleValue: '',
  parameters: [],
  inputs: [createSearchInputFormData()],
  transformCode: '',
  conditionCode: '',
  actions: [createEmailActionFormData()],
  ...overrides,
})

// =============================================================================
// Default Test Data (stable IDs for assertions)
// =============================================================================

export const testUser = createUser({
  username: 'test.user',
  user: 'test.user',
  firstName: 'Test',
  lastName: 'User',
  email: 'test.user@blizzard.com',
  admin: false,
  groups: [
    createGroup({ id: 1, fullname: 'Test Group', write: true }),
    createGroup({ id: 2, fullname: 'Read Only Group', write: false }),
  ],
})

export const testAdminUser = createUser({
  username: 'admin.user',
  user: 'admin.user',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin.user@blizzard.com',
  admin: true,
  groups: [createGroup({ id: 1, fullname: 'Admin Group', write: true })],
})

export const testRules = [
  createRule({ id: 1, name: 'Login Monitor', enabled: 1, trigger_count: 0 }),
  createRule({ id: 2, name: 'Error Alert', enabled: 1, trigger_count: 3 }),
  createRule({ id: 3, name: 'Latency Check', enabled: 0, trigger_count: 0 }),
]

export const testRegions = createRegions()

// =============================================================================
// Chromie Regions (Admin Page)
// =============================================================================

export const testChromieRegions = ['us-west', 'us-east', 'eu-west', 'eu-east', 'apac']

export const testDisabledRegions = ['eu-east', 'apac']

export const createChromieRegion = (name: string, isDisabled = false) => ({
  name,
  isDisabled,
})

// =============================================================================
// Rule History Entry Factory
// =============================================================================

const HISTORY_ACTIONS = ['update', 'move', 'enable', 'disable', 'create', 'delete'] as const

export const createRuleHistoryEntry = (
  overrides: Partial<RuleHistoryEntry> = {}
): RuleHistoryEntry => ({
  rule_id: faker.number.int({ min: 1, max: 10000 }),
  action: faker.helpers.arrayElement(HISTORY_ACTIONS),
  username: faker.internet.username(),
  date: faker.date.past().toISOString(),
  version: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 50 }) : null,
  region: faker.helpers.arrayElement(REGION_NAMES),
  ...overrides,
})

export const createRuleHistoryEntries = (
  count: number,
  ruleId?: number,
  overrides: Partial<RuleHistoryEntry> = {}
): RuleHistoryEntry[] => {
  const entries: RuleHistoryEntry[] = []
  let currentVersion = faker.number.int({ min: 1, max: 10 })

  for (let i = 0; i < count; i++) {
    const action = faker.helpers.arrayElement(HISTORY_ACTIONS)
    const entry: RuleHistoryEntry = {
      rule_id: ruleId ?? faker.number.int({ min: 1, max: 10000 }),
      action,
      username: faker.internet.username(),
      date: faker.date.recent({ days: 30 }).toISOString(),
      version: action === 'update' ? currentVersion++ : null,
      region: faker.helpers.arrayElement(REGION_NAMES),
      ...overrides,
    }
    entries.push(entry)
  }

  // Sort by date descending (most recent first)
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Sample test history data with realistic progression
export const createTestRuleHistory = (ruleId: number): RuleHistoryEntry[] => [
  {
    rule_id: ruleId,
    action: 'update',
    username: 'mmohiuddin',
    date: '2025-11-19T03:27:39.000Z',
    version: 2,
    region: 'dev',
  },
  {
    rule_id: ruleId,
    action: 'move',
    username: 'bechoi',
    date: '2018-10-01T21:28:15.000Z',
    version: null,
    region: 'dev',
  },
  {
    rule_id: ruleId,
    action: 'enable',
    username: 'bechoi',
    date: '2018-08-09T00:02:51.000Z',
    version: null,
    region: 'dev',
  },
  {
    rule_id: ruleId,
    action: 'disable',
    username: 'cpyle',
    date: '2018-08-09T00:45:05.000Z',
    version: null,
    region: 'dev',
  },
  {
    rule_id: ruleId,
    action: 'create',
    username: 'bechoi',
    date: '2018-07-25T22:58:03.000Z',
    version: 1,
    region: 'dev',
  },
]
