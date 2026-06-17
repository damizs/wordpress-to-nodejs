const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS_PER_ACCOUNT = 5
const MAX_ATTEMPTS_PER_IP = 25

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

function ipKeyFor(ip: string) {
  return `ip:${ip}`
}

function getActiveBucket(key: string) {
  const bucket = attempts.get(key)
  if (!bucket) return null
  if (bucket.resetAt <= now()) {
    attempts.delete(key)
    return null
  }
  return bucket
}

function increment(key: string) {
  const current = attempts.get(key)
  const timestamp = now()
  if (!current || current.resetAt <= timestamp) {
    attempts.set(key, { count: 1, resetAt: timestamp + WINDOW_MS })
    return
  }
  current.count += 1
}

export function isLoginRateLimited(ip: string, email: string): boolean {
  const accountBucket = getActiveBucket(keyFor(ip, email))
  const ipBucket = getActiveBucket(ipKeyFor(ip))
  return (
    (accountBucket?.count ?? 0) >= MAX_ATTEMPTS_PER_ACCOUNT ||
    (ipBucket?.count ?? 0) >= MAX_ATTEMPTS_PER_IP
  )
}

export function recordFailedLogin(ip: string, email: string) {
  increment(keyFor(ip, email))
  increment(ipKeyFor(ip))
}

export function clearFailedLogins(ip: string, email: string) {
  attempts.delete(keyFor(ip, email))
}
