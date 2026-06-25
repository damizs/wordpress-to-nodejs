const WINDOW_MS = 60 * 60 * 1000
const MAX_SUBMISSIONS_PER_IP = 10
const MAX_BUCKETS = 5_000

interface AttemptBucket {
  count: number
  resetAt: number
}

const attempts = new Map<string, AttemptBucket>()

function now() {
  return Date.now()
}

function ipKeyFor(ip: string) {
  return `survey:${ip || 'unknown'}`
}

function pruneExpiredBuckets(timestamp = now()) {
  for (const [key, bucket] of attempts) {
    if (bucket.resetAt <= timestamp) attempts.delete(key)
  }

  if (attempts.size <= MAX_BUCKETS) return

  const overflow = attempts.size - MAX_BUCKETS
  const oldestKeys = [...attempts.entries()]
    .sort((a, b) => a[1].resetAt - b[1].resetAt)
    .slice(0, overflow)
    .map(([key]) => key)

  for (const key of oldestKeys) attempts.delete(key)
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
  pruneExpiredBuckets(timestamp)
  if (!current || current.resetAt <= timestamp) {
    attempts.set(key, { count: 1, resetAt: timestamp + WINDOW_MS })
    return
  }
  current.count += 1
}

export function isSurveyRateLimited(ip: string): boolean {
  const bucket = getActiveBucket(ipKeyFor(ip))
  return (bucket?.count ?? 0) >= MAX_SUBMISSIONS_PER_IP
}

export function recordSurveySubmission(ip: string) {
  increment(ipKeyFor(ip))
}
