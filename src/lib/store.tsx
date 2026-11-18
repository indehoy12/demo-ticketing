import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { DemoState } from './types'
import { reducer, isValidState, type Action } from './logic'
import { SESSION_KEY, createSeedState } from './seed'

function load(): DemoState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (isValidState(parsed)) return parsed
    }
  } catch { /* storage blocked or corrupted: fall back to seed */ }
  return createSeedState()
}

interface Ctx {
  state: DemoState
  dispatch: (a: Action) => void
}
const DemoContext = createContext<Ctx | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const value = useMemo<Ctx>(
    () => ({ state, dispatch }),
    [state],
  )
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const c = useContext(DemoContext)
  if (!c) throw new Error('useDemo must be used inside DemoProvider')
  return c
}
