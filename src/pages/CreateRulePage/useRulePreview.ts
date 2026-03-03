// =============================================================================
// useRulePreview - Shared hook that auto-runs the rule preview and caches
// results so they persist across step navigation.
//
// KEY BEHAVIOR:
//   1. On mount: immediately show cached result (if any) from the Zustand store
//   2. On mount: auto-fire a fresh preview run after a short delay
//   3. On form changes: debounce and re-run automatically
//   4. Results persist in Zustand so switching steps shows data instantly
//   5. No "Click Run Query" blank states - data is always live
// =============================================================================

import { useCallback, useEffect, useRef } from 'react'
import { create } from 'zustand'
import { useFormContext } from 'react-hook-form'
import { useRunRule } from '@/hooks/useApi'
import { transformFormToPayload } from '@/utils/ruleTransform'
import type { RuleFormData } from '@/types/rule'
import type { StopStep, RuntimePreviewResult } from '@/types/api'

// ---------------------------------------------------------------------------
// Zustand store - survives React re-renders and step unmount/remount
// ---------------------------------------------------------------------------

interface PreviewState {
  results: Partial<Record<StopStep, RuntimePreviewResult>>
  generation: number
  runningSteps: Set<StopStep>
  error: Error | null
  lastPayloadHash: Partial<Record<StopStep, string>>

  setResult: (stop: StopStep, result: RuntimePreviewResult, hash: string) => void
  setRunning: (stop: StopStep, running: boolean) => void
  setError: (error: Error | null) => void
  clearAll: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  results: {},
  generation: 0,
  runningSteps: new Set(),
  error: null,
  lastPayloadHash: {},

  setResult: (stop, result, hash) =>
    set((s) => ({
      results: { ...s.results, [stop]: result },
      lastPayloadHash: { ...s.lastPayloadHash, [stop]: hash },
      generation: s.generation + 1,
      runningSteps: (() => {
        const next = new Set(s.runningSteps)
        next.delete(stop)
        return next
      })(),
      error: null,
    })),

  setRunning: (stop, running) =>
    set((s) => {
      const next = new Set(s.runningSteps)
      if (running) next.add(stop)
      else next.delete(stop)
      return { runningSteps: next }
    }),

  setError: (error) =>
    set(() => ({
      error,
      runningSteps: new Set(),
    })),

  clearAll: () =>
    set({ results: {}, generation: 0, error: null, lastPayloadHash: {}, runningSteps: new Set() }),
}))

// ---------------------------------------------------------------------------
// Simple hash to detect form changes without deep-comparing objects
// ---------------------------------------------------------------------------
function quickHash(obj: unknown): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return String(Date.now())
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseRulePreviewOptions {
  stopStep: StopStep
  autoRun?: boolean
  debounceMs?: number
}

export const useRulePreview = ({
  stopStep,
  autoRun = true,
  debounceMs = 1200,
}: UseRulePreviewOptions) => {
  const { getValues, watch } = useFormContext<RuleFormData>()
  const runMutation = useRunRule()

  const result = usePreviewStore((s) => s.results[stopStep] ?? null)
  const isStepRunning = usePreviewStore((s) => s.runningSteps.has(stopStep))
  const error = usePreviewStore((s) => s.error)
  const setResult = usePreviewStore((s) => s.setResult)
  const setRunning = usePreviewStore((s) => s.setRunning)
  const setError = usePreviewStore((s) => s.setError)
  const lastHash = usePreviewStore((s) => s.lastPayloadHash[stopStep])

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  // Stable run function
  const run = useCallback(() => {
    const formData = getValues()
    const payload = transformFormToPayload(formData)
    const hash = quickHash(payload)

    setRunning(stopStep, true)

    runMutation.mutate(
      { rule: payload, stop: stopStep },
      {
        onSuccess: (data) => {
          if (mountedRef.current) {
            setResult(stopStep, data, hash)
          }
        },
        onError: (err) => {
          if (mountedRef.current) {
            setRunning(stopStep, false)
            setError(err instanceof Error ? err : new Error('Preview failed'))
          }
        },
      }
    )
  }, [getValues, runMutation, stopStep, setResult, setRunning, setError])

  // ---------- AUTO-RUN ON EVERY MOUNT ----------
  // Always fire on mount. Cached result is shown instantly while fresh run
  // happens in background. No hasFiredRef - every step entry gets fresh data.
  useEffect(() => {
    mountedRef.current = true

    if (!autoRun) return

    const mountTimer = setTimeout(() => {
      if (!mountedRef.current) return

      const formData = getValues()
      const payload = transformFormToPayload(formData)
      const hash = quickHash(payload)

      // Always run if no cached result, or if form changed since last run
      if (!result || hash !== lastHash) {
        run()
      }
    }, 300)

    return () => {
      mountedRef.current = false
      clearTimeout(mountTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount

  // ---------- WATCH FORM CHANGES & DEBOUNCE RE-RUNS ----------
  useEffect(() => {
    if (!autoRun) return

    const subscription = watch(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          run()
        }
      }, debounceMs)
    })

    return () => {
      subscription.unsubscribe()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [watch, run, autoRun, debounceMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    result,
    isRunning: isStepRunning || runMutation.isPending,
    error,
    run,
    hasCachedData: result !== null,
  }
}
