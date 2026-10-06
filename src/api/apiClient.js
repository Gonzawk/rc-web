const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5080'
).replace(/\/$/, '')

const DEFAULT_TIMEOUT = 12000

function isNgrokUrl(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase()

    return (
      hostname.endsWith('.ngrok-free.app') ||
      hostname.endsWith('.ngrok.app') ||
      hostname.endsWith('.ngrok.io')
    )
  } catch {
    return false
  }
}

const IS_NGROK = isNgrokUrl(API_URL)

export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      body = null,
      kind = 'http',
      cause = null,
    } = {}
  ) {
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

  // Sólo se utiliza durante desarrollo cuando la API está expuesta
  // mediante ngrok. Evita la página intermedia del plan gratuito.
  //
  // En producción, con api.rc-repuestos.com, este header no se envía.
  if (IS_NGROK) {
    headers.set('ngrok-skip-browser-warning', 'true')
  }

  // No enviar Content-Type innecesariamente en GET/HEAD.
  // Para requests con body JSON sí corresponde.
  if (
    options.body != null &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
      }
    )

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
      const fallback =
        response.status >= 500
          ? 'La API encontró un problema interno.'
          : `Error HTTP ${response.status}`

      throw new ApiError(
        body?.message ||
          body?.title ||
          fallback,
        {
          status: response.status,
          body,
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
          cause: error,
        }
      )
    }

    throw new ApiError(
      'No se pudo conectar con la API.',
      {
        kind: 'network',
        cause: error,
      }
    )
  } finally {
    clearTimeout(timeout)
  }
}

export const adminAuth = {
  login: code =>
    apiFetch(
      '/api/admin/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      }
    ),

  session: () =>
    apiFetch(
      '/api/admin/auth/session',
      {
        cache: 'no-store',
      }
    ),

  logout: () =>
    apiFetch(
      '/api/admin/auth/logout',
      {
        method: 'POST',
      }
    ),
}