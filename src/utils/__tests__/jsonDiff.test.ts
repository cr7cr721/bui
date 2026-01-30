// utils/__tests__/jsonDiff.test.ts
import { describe, it, expect } from 'vitest'
import { computeDiff, flattenDiff, formatValue, getDiffSummary, type DiffNode } from '../jsonDiff'

describe('jsonDiff', () => {
  describe('computeDiff', () => {
    it('returns empty array for identical objects', () => {
      const obj = { name: 'test', value: 123 }
      const diff = computeDiff(obj, obj)
      expect(diff).toHaveLength(0)
    })

    it('detects added properties', () => {
      const oldObj = { name: 'test' }
      const newObj = { name: 'test', value: 123 }
      const diff = computeDiff(oldObj, newObj)

      expect(diff).toHaveLength(1)
      expect(diff[0].type).toBe('changed')
      expect(diff[0].children).toBeDefined()

      const addedChild = diff[0].children?.find((c) => c.key === 'value')
      expect(addedChild?.type).toBe('added')
      expect(addedChild?.newValue).toBe(123)
    })

    it('detects removed properties', () => {
      const oldObj = { name: 'test', value: 123 }
      const newObj = { name: 'test' }
      const diff = computeDiff(oldObj, newObj)

      expect(diff).toHaveLength(1)
      const removedChild = diff[0].children?.find((c) => c.key === 'value')
      expect(removedChild?.type).toBe('removed')
      expect(removedChild?.oldValue).toBe(123)
    })

    it('detects changed values', () => {
      const oldObj = { name: 'old' }
      const newObj = { name: 'new' }
      const diff = computeDiff(oldObj, newObj)

      expect(diff).toHaveLength(1)
      const changedChild = diff[0].children?.find((c) => c.key === 'name')
      expect(changedChild?.type).toBe('changed')
      expect(changedChild?.oldValue).toBe('old')
      expect(changedChild?.newValue).toBe('new')
    })

    it('handles nested objects', () => {
      const oldObj = {
        config: {
          timeout: 100,
          retries: 3,
        },
      }
      const newObj = {
        config: {
          timeout: 200,
          retries: 3,
        },
      }
      const diff = computeDiff(oldObj, newObj)

      expect(diff.length).toBeGreaterThan(0)
      // Should detect change in config.timeout
      const flattened = flattenDiff(diff)
      const timeoutChange = flattened.find((d) => d.path.includes('timeout'))
      expect(timeoutChange?.type).toBe('changed')
    })

    it('handles array changes', () => {
      const oldObj = { items: ['a', 'b'] }
      const newObj = { items: ['a', 'c'] }
      const diff = computeDiff(oldObj, newObj)

      expect(diff.length).toBeGreaterThan(0)
      const flattened = flattenDiff(diff)
      expect(flattened.some((d) => d.path.includes('items'))).toBe(true)
    })

    it('handles array length changes', () => {
      const oldObj = { items: ['a', 'b'] }
      const newObj = { items: ['a', 'b', 'c'] }
      const diff = computeDiff(oldObj, newObj)

      expect(diff.length).toBeGreaterThan(0)
      const flattened = flattenDiff(diff)
      const addedItem = flattened.find((d) => d.type === 'added')
      expect(addedItem).toBeDefined()
    })

    it('handles null values', () => {
      const oldObj = { value: null }
      const newObj = { value: 'something' }
      const diff = computeDiff(oldObj, newObj)

      expect(diff.length).toBeGreaterThan(0)
    })

    it('handles type changes', () => {
      const oldObj = { value: '123' }
      const newObj = { value: 123 }
      const diff = computeDiff(oldObj, newObj)

      expect(diff.length).toBeGreaterThan(0)
      const flattened = flattenDiff(diff)
      const typeChange = flattened.find((d) => d.path === 'value')
      expect(typeChange?.type).toBe('changed')
    })
  })

  describe('flattenDiff', () => {
    it('flattens nested diff nodes', () => {
      const nodes: DiffNode[] = [
        {
          path: 'config',
          key: 'config',
          type: 'changed',
          depth: 0,
          children: [
            {
              path: 'config.timeout',
              key: 'timeout',
              type: 'changed',
              oldValue: 100,
              newValue: 200,
              depth: 1,
            },
          ],
        },
      ]

      const flattened = flattenDiff(nodes)
      expect(flattened).toHaveLength(2)
      expect(flattened[0].path).toBe('config')
      expect(flattened[1].path).toBe('config.timeout')
    })

    it('preserves depth information', () => {
      const nodes: DiffNode[] = [
        {
          path: 'root',
          key: 'root',
          type: 'changed',
          depth: 0,
          children: [
            {
              path: 'root.child',
              key: 'child',
              type: 'added',
              newValue: 'new',
              depth: 1,
            },
          ],
        },
      ]

      const flattened = flattenDiff(nodes)
      expect(flattened[0].depth).toBe(0)
      expect(flattened[1].depth).toBe(1)
    })
  })

  describe('formatValue', () => {
    it('formats strings with quotes', () => {
      expect(formatValue('hello')).toBe('"hello"')
    })

    it('formats numbers without quotes', () => {
      expect(formatValue(123)).toBe('123')
    })

    it('formats null', () => {
      expect(formatValue(null)).toBe('null')
    })

    it('formats undefined', () => {
      expect(formatValue(undefined)).toBe('undefined')
    })

    it('formats objects as JSON', () => {
      const result = formatValue({ a: 1 })
      expect(result).toContain('"a"')
      expect(result).toContain('1')
    })

    it('formats arrays as JSON', () => {
      const result = formatValue([1, 2, 3])
      expect(result).toBe('[\n  1,\n  2,\n  3\n]')
    })

    it('formats booleans', () => {
      expect(formatValue(true)).toBe('true')
      expect(formatValue(false)).toBe('false')
    })
  })

  describe('getDiffSummary', () => {
    it('counts added items', () => {
      const items = [
        { path: 'a', type: 'added' as const, newValue: 1, depth: 0 },
        { path: 'b', type: 'added' as const, newValue: 2, depth: 0 },
      ]
      const summary = getDiffSummary(items)
      expect(summary.added).toBe(2)
      expect(summary.removed).toBe(0)
      expect(summary.changed).toBe(0)
    })

    it('counts removed items', () => {
      const items = [{ path: 'a', type: 'removed' as const, oldValue: 1, depth: 0 }]
      const summary = getDiffSummary(items)
      expect(summary.removed).toBe(1)
    })

    it('counts changed items with old values', () => {
      const items = [{ path: 'a', type: 'changed' as const, oldValue: 1, newValue: 2, depth: 0 }]
      const summary = getDiffSummary(items)
      expect(summary.changed).toBe(1)
    })

    it('does not count container nodes as changes', () => {
      const items = [
        { path: 'config', type: 'changed' as const, depth: 0 }, // Container, no oldValue
        { path: 'config.a', type: 'changed' as const, oldValue: 1, newValue: 2, depth: 1 },
      ]
      const summary = getDiffSummary(items)
      expect(summary.changed).toBe(1) // Only the leaf node
    })
  })

  describe('real-world rule diff scenarios', () => {
    it('detects action changes in rule body', () => {
      const oldRule = {
        name: 'test',
        author: 'user@test.com',
        actions: [
          {
            email: {
              to: 'old@test.com',
              subject: 'Old Subject',
            },
          },
        ],
      }

      const newRule = {
        name: 'test',
        author: 'user@test.com',
        actions: [
          {
            email: {
              to: 'new@test.com',
              subject: 'New Subject',
            },
          },
        ],
      }

      const diff = computeDiff(oldRule, newRule)
      const flattened = flattenDiff(diff)

      // Should detect changes in the email action
      const emailChanges = flattened.filter((d) => d.path.includes('email'))
      expect(emailChanges.length).toBeGreaterThan(0)
    })

    it('detects added throttle config', () => {
      const oldRule = {
        actions: [
          {
            request: { url: 'http://test.com' },
          },
        ],
      }

      const newRule = {
        actions: [
          {
            request: { url: 'http://test.com' },
            throttle: { time: '1s', entityKey: 'whisk' },
          },
        ],
      }

      const diff = computeDiff(oldRule, newRule)
      const flattened = flattenDiff(diff)

      const throttleChange = flattened.find((d) => d.path.includes('throttle'))
      expect(throttleChange).toBeDefined()
      expect(throttleChange?.type).toBe('added')
    })

    it('detects schedule changes', () => {
      const oldRule = {
        schedule: { interval: '1m' },
      }

      const newRule = {
        schedule: { interval: '10s' },
      }

      const diff = computeDiff(oldRule, newRule)
      const flattened = flattenDiff(diff)

      const intervalChange = flattened.find((d) => d.path.includes('interval'))
      expect(intervalChange?.type).toBe('changed')
      expect(intervalChange?.oldValue).toBe('1m')
      expect(intervalChange?.newValue).toBe('10s')
    })
  })
})
