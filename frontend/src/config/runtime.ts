/**
 * Runtime backend URLs for API and Socket.IO.
 * Used so the app works both on localhost and from another device on the LAN.
 *
 * - VITE_API_URL / VITE_SOCKET_URL: use if set (build-time env).
 * - Otherwise: http://<window.location.hostname>:5000
 *
 * Examples:
 * - Frontend at http://localhost:5173     -> backend http://localhost:5000
 * - Frontend at http://192.168.0.14:5173   -> backend http://192.168.0.14:5000
 */
const BACKEND_PORT = 5000

function getDefaultBaseUrl(): string {
  if (typeof window === 'undefined') {
    return `http://localhost:${BACKEND_PORT}`
  }
  return `http://${window.location.hostname}:${BACKEND_PORT}`
}

function fromEnv(key: 'VITE_API_URL' | 'VITE_SOCKET_URL'): string {
  const v = import.meta.env[key] as string | undefined
  if (v != null && String(v).trim() !== '') {
    return String(v).replace(/\/$/, '')
  }
  return getDefaultBaseUrl()
}

/** Backend base URL for REST/API calls. */
export function getApiBaseUrl(): string {
  return fromEnv('VITE_API_URL')
}

/** Backend URL for Socket.IO connection. */
export function getSocketUrl(): string {
  return fromEnv('VITE_SOCKET_URL')
}
