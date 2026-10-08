
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5080'
).replace(/\/+$/, '')

const DEFAULT_TIMEOUT = 12000

const isNgrokHost = (() => {
  try {
    const hostname = new URL(API_URL).hostname.toLowerCase()

    return (
      hostname.endsWith('.ngrok-free.app') ||
      hostname.endsWith('.ngrok-free.dev') ||
      hostname.endsWith('.ngrok.app') ||
      hostname.endsWith('.ngrok.io')
    )
  } catch {
    return false
  }
})()

export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      body = null,
      kind = 'http',
      cause = null
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
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    headers: customHeaders,
    signal: externalSignal,
    ...fetchOptions
  } = options

  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  const headers = new Headers(customHeaders || {})

  // El encabezado solo se agrega cuando la API utiliza ngrok.
  // Evita que ngrok entregue su página HTML de advertencia.
  if (isNgrokHost) {
    headers.set('ngrok-skip-browser-warning', 'true')
  }

  // Mantiene el comportamiento original para solicitudes JSON.
  if (
    fetchOptions.body != null &&
    !headers.has('Content-Type') &&
    !(fetchOptions.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
      credentials: 'include',
      signal: externalSignal
        ? AbortSignal.any([
            controller.signal,
            externalSignal
          ])
        : controller.signal
    })

    if (response.status === 204) {
      return null
    }

    const contentType = response.headers.get('Content-Type') || ''
    const text = await response.text()

    // Detecta respuestas HTML inesperadas de ngrok
    // o de cualquier intermediario.
    if (
      contentType.includes('text/html') &&
      /ngrok|ERR_NGROK_/i.test(text)
    ) {
      throw new ApiError(
        'Ngrok devolvió una página de advertencia en lugar de la API.',
        {
          status: response.status,
          kind: 'ngrok',
          body: text
        }
      )
    }

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
        'La solicitud fue cancelada o tardó demasiado en responder.',
        {
          kind: 'timeout',
          cause: error
        }
      )
    }

    throw new ApiError(
      'No se pudo conectar con la API. Verificá que el servidor y el túnel estén activos.',
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
