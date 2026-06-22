interface CacheEntry<T> {
  expiresAt: number
  value: T
}

export default class RuntimeCache {
  private static entries = new Map<string, CacheEntry<unknown>>()
  private static readonly maxEntries = 500

  static async getOrSet<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    this.pruneExpired()

    const cached = this.entries.get(key) as CacheEntry<T> | undefined
    if (cached && cached.expiresAt > Date.now()) return cached.value

    const value = await factory()
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs })
    this.enforceLimit()
    return value
  }

  static forget(keyPrefix: string) {
    for (const key of this.entries.keys()) {
      if (key.startsWith(keyPrefix)) this.entries.delete(key)
    }
  }

  private static pruneExpired(now = Date.now()) {
    for (const [key, entry] of this.entries.entries()) {
      if (entry.expiresAt <= now) this.entries.delete(key)
    }
  }

  private static enforceLimit() {
    const overflow = this.entries.size - this.maxEntries
    if (overflow <= 0) return

    const keysToDelete = [...this.entries.entries()]
      .sort(([, a], [, b]) => a.expiresAt - b.expiresAt)
      .slice(0, overflow)
      .map(([key]) => key)

    for (const key of keysToDelete) this.entries.delete(key)
  }
}
