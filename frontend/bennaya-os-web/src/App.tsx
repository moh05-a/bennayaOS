import { useEffect, useState } from 'react'
import { api, ApiError } from './services/api'
import type { DatabaseHealth } from './types/health'

type ConnectionState =
  | { kind: 'loading' }
  | { kind: 'connected'; data: DatabaseHealth }
  // The API answered, but a dependency (the database) is down.
  | { kind: 'dependencyDown'; message: string }
  // We never reached the API at all: server off, wrong port, or CORS.
  | { kind: 'apiUnreachable'; message: string }

function App() {
  const [state, setState] = useState<ConnectionState>({ kind: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    api
      .get<DatabaseHealth>('/api/health/db', controller.signal)
      .then((data) => setState({ kind: 'connected', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        if (error instanceof ApiError) {
          // ApiError.status === 0 means fetch itself failed (network/CORS).
          // Any real HTTP status means the API responded - so the API is UP
          // and the problem is behind it. Conflating these sends you
          // debugging the wrong layer.
          const reason =
            (error.body as { reason?: string } | null)?.reason ?? error.message

          setState(
            error.status === 0
              ? { kind: 'apiUnreachable', message: error.message }
              : { kind: 'dependencyDown', message: reason },
          )
          return
        }

        setState({ kind: 'apiUnreachable', message: 'Unexpected error' })
      })

    return () => controller.abort()
  }, [])

  const apiReached = state.kind === 'connected' || state.kind === 'dependencyDown'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">BennayaOS</h1>
        <p className="mt-1 text-sm text-slate-500">Phase 1 - system check</p>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Frontend</dt>
            <dd className="font-medium text-emerald-600">Running</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-slate-600">API</dt>
            <dd className="font-medium">
              {state.kind === 'loading' && <span className="text-slate-400">Checking...</span>}
              {apiReached && <span className="text-emerald-600">Reachable</span>}
              {state.kind === 'apiUnreachable' && <span className="text-red-600">Unreachable</span>}
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Database</dt>
            <dd className="font-medium">
              {state.kind === 'loading' && <span className="text-slate-400">Checking...</span>}
              {state.kind === 'connected' && (
                <span className="text-emerald-600">{state.data.database}</span>
              )}
              {state.kind === 'dependencyDown' && <span className="text-red-600">Unreachable</span>}
              {state.kind === 'apiUnreachable' && <span className="text-slate-400">Unknown</span>}
            </dd>
          </div>
        </dl>

        {(state.kind === 'dependencyDown' || state.kind === 'apiUnreachable') && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 break-words">
            {state.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default App
