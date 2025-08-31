// Simple namespaced localStorage helpers

const NS = "libapp_v1"

export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(`${NS}:${key}`)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function lsSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value))
  } catch {
    // ignore
  }
}
