const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

interface AttemptBucket {
  count: number
  resetAt: number
}

const attempts = new Map<string, AttemptBucket>()

function now() {
  return Date.now()
}

function keyFor(ip: string, email: string) {
  return `${ip}:${email.toLowerCase()}`
}

export function isLoginRateLimited(ip: string, email: string): boolean {
  const key = keyFor(ip, email)
  const bucket = attempts.get(key)
  if (!bucket) return false
  if (bucket.resetAt <= now()) {
    attempts.delete(key)
    return false
  }
  return bucket.count >= MAX_ATTEMPTS
}

export function recordFailedLogin(ip: string, email: string) {
  const key = keyFor(ip, email)
  const current = attempts.get(key)
  const timestamp = now()
  if (!current || current.resetAt <= timestamp) {
    attempts.set(key, { count: 1, resetAt: timestamp + WINDOW_MS })
    return
  }
  current.count += 1
}

export function clearFailedLogins(ip: string, email: string) {
  attempts.delete(keyFor(ip, email))
}
