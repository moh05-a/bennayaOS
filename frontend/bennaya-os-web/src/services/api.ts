/**
 * Centralized API client.
 *
 * Every network call in the app goes through here. That gives us ONE place to
 * change the base URL, attach the JWT (Phase 3), and normalize error handling.
 * No component should ever call fetch() directly.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL

/** Thrown for any non-2xx response, so callers can try/catch instead of checking res.ok. */
export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
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
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  // Phase 3 will add: headers.Authorization = `Bearer ${token}`

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
    throw new ApiError(0, 'Cannot reach the server. Is the API running?', cause)
  }

  // 204 No Content has an empty body - parsing it as JSON would throw.
  const hasJson = response.headers.get('content-type')?.includes('application/json')
  const payload: unknown = hasJson ? await response.json() : null

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed (${response.status})`, payload)
  }

  return payload as TResponse
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
