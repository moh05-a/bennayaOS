import { authStorage } from './authStorage'
import { languageStorage } from './languageStorage'
import { translate } from '../i18n'
import type { ProblemDetails } from '../types/api'

/**
 * Centralized API client. Every network call goes through here, which gives us
 * one place to attach the JWT, parse errors, and react to an expired session.
 * No component should ever call fetch() directly.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL

/** Called when the server rejects our token, so the app can log the user out. */
type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

export class ApiError extends Error {
  readonly status: number
  readonly problem: ProblemDetails | null

  constructor(status: number, message: string, problem: ProblemDetails | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }

  /** Field-level validation errors, keyed by lower-cased field name. */
  get fieldErrors(): Record<string, string> {
    const errors = this.problem?.errors
    if (!errors) return {}

    return Object.entries(errors).reduce<Record<string, string>>((acc, [field, messages]) => {
      const first = messages[0]
      if (first) acc[field.toLowerCase()] = first
      return acc
    }, {})
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

async function request<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, signal } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  // Attached here once, so no component ever handles the token itself.
  const session = authStorage.read()
  if (session) headers.Authorization = `Bearer ${session.token}`

  // The API answers in this language, so its error messages match the UI.
  const language = languageStorage.read()
  headers['Accept-Language'] = language

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (cause) {
    // fetch only rejects on network-level failures (server down, DNS, CORS).
    throw new ApiError(0, translate(language, 'errors.network'), null)
  }

  // 401 means the token is missing, expired or invalid. Handled centrally so
  // every screen logs out consistently instead of showing its own broken state.
  if (response.status === 401) {
    onUnauthorized?.()
    throw new ApiError(401, translate(language, 'errors.sessionExpired'), null)
  }

  const isJson = response.headers.get('content-type')?.includes('json')
  const payload: unknown = isJson ? await response.json() : null

  if (!response.ok) {
    const problem = payload as ProblemDetails | null
    throw new ApiError(
      response.status,
      problem?.title ?? translate(language, 'errors.requestFailed', { status: response.status }),
      problem,
    )
  }

  return payload as TResponse
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
}
