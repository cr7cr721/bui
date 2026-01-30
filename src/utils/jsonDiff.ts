// utils/jsonDiff.ts
// Utility for computing and displaying JSON diffs between rule versions

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

export interface DiffNode {
  path: string
  key: string
  type: DiffType
  oldValue?: unknown
  newValue?: unknown
  children?: DiffNode[]
  depth: number
}

/**
 * Compute the diff between two JSON objects
 */
export const computeDiff = (
  oldObj: unknown,
  newObj: unknown,
  path = '',
  key = 'root',
  depth = 0
): DiffNode[] => {
  const results: DiffNode[] = []

  // Both are null/undefined
  if (oldObj == null && newObj == null) {
    return []
  }

  // Only in new (added)
  if (oldObj == null && newObj != null) {
    results.push({
      path,
      key,
      type: 'added',
      newValue: newObj,
      depth,
    })
    return results
  }

  // Only in old (removed)
  if (oldObj != null && newObj == null) {
    results.push({
      path,
      key,
      type: 'removed',
      oldValue: oldObj,
      depth,
    })
    return results
  }

  // Different types
  if (typeof oldObj !== typeof newObj) {
    results.push({
      path,
      key,
      type: 'changed',
      oldValue: oldObj,
      newValue: newObj,
      depth,
    })
    return results
  }

  // Both are primitives
  if (typeof oldObj !== 'object' || oldObj === null) {
    if (oldObj !== newObj) {
      results.push({
        path,
        key,
        type: 'changed',
        oldValue: oldObj,
        newValue: newObj,
        depth,
      })
    }
    return results
  }

  // Both are arrays
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    const maxLen = Math.max(oldObj.length, newObj.length)
    const arrayDiffs: DiffNode[] = []

    for (let i = 0; i < maxLen; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`
      const childDiffs = computeDiff(oldObj[i], newObj[i], itemPath, String(i), depth + 1)
      arrayDiffs.push(...childDiffs)
    }

    if (arrayDiffs.length > 0) {
      results.push({
        path,
        key,
        type: 'changed',
        children: arrayDiffs,
        depth,
      })
    }

    return results
  }

  // Both are objects
  const oldObjTyped = oldObj as Record<string, unknown>
  const newObjTyped = newObj as Record<string, unknown>
  const allKeys = new Set([...Object.keys(oldObjTyped), ...Object.keys(newObjTyped)])
  const objectDiffs: DiffNode[] = []

  for (const k of allKeys) {
    const childPath = path ? `${path}.${k}` : k
    const childDiffs = computeDiff(oldObjTyped[k], newObjTyped[k], childPath, k, depth + 1)
    objectDiffs.push(...childDiffs)
  }

  if (objectDiffs.length > 0) {
    results.push({
      path,
      key,
      type: 'changed',
      children: objectDiffs,
      depth,
    })
  }

  return results
}

/**
 * Flatten diff tree into a list of changes for display
 */
export interface FlatDiffItem {
  path: string
  type: DiffType
  oldValue?: unknown
  newValue?: unknown
  depth: number
}

export const flattenDiff = (nodes: DiffNode[]): FlatDiffItem[] => {
  const result: FlatDiffItem[] = []

  const traverse = (node: DiffNode) => {
    if (node.children && node.children.length > 0) {
      // This is a container node (object or array that has changes)
      result.push({
        path: node.path || node.key,
        type: 'changed',
        depth: node.depth,
      })
      node.children.forEach(traverse)
    } else {
      // This is a leaf node with actual changes
      result.push({
        path: node.path || node.key,
        type: node.type,
        oldValue: node.oldValue,
        newValue: node.newValue,
        depth: node.depth,
      })
    }
  }

  nodes.forEach(traverse)
  return result
}

/**
 * Format a value for display
 */
export const formatValue = (value: unknown): string => {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

/**
 * Get a human-readable summary of changes
 */
export const getDiffSummary = (
  diffs: FlatDiffItem[]
): { added: number; removed: number; changed: number } => {
  return diffs.reduce(
    (acc, diff) => {
      if (diff.type === 'added') acc.added++
      else if (diff.type === 'removed') acc.removed++
      else if (diff.type === 'changed' && diff.oldValue !== undefined) acc.changed++
      return acc
    },
    { added: 0, removed: 0, changed: 0 }
  )
}
