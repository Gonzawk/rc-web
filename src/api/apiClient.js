const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5080'
).replace(/\/$/, '')

const DEFAULT_TIMEOUT = 12000

export class ApiError extends Error {
  constructor(message, {
    status = 0,
    body = null,
    kind = 'http',
    cause = null
  } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    this.kind = kind
    this.cause = cause
  }
}

export async function apiFetch(path, options = {}) {
  const controller = new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs || DEFAULT_TIMEOUT
  )

  const headers = new Headers(options.headers || {})

  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal
    })

    if (response.status === 204) {
      return null
    }

    const text = await response.text()

    let body = null

    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = text
    }

    if (!response.ok) {
      throw new ApiError(
        body?.message ||
        body?.title ||
        `Error HTTP ${response.status}`,
        {
          status: response.status,
          body
        }
      )
    }

    return body
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error?.name === 'AbortError') {
      throw new ApiError(
        'La API tardó demasiado en responder.',
        {
          kind: 'timeout',
          cause: error
        }
      )
    }

    throw new ApiError(
      'No se pudo conectar con la API.',
      {
        kind: 'network',
        cause: error
      }
    )
  } finally {
    clearTimeout(timeout)
  }
}

export const adminAuth = {
  login: code =>
    apiFetch('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ code })
    }),

  session: () =>
    apiFetch('/api/admin/auth/session', {
      cache: 'no-store'
    }),

  logout: () =>
    apiFetch('/api/admin/auth/logout', {
      method: 'POST'
    })
}