interface CacheEntry<T> {
  expiresAt: number
  value: T
}

export default class RuntimeCache {
  private static entries = new Map<string, CacheEntry<unknown>>()

  static async getOrSet<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const cached = this.entries.get(key) as CacheEntry<T> | undefined
    if (cached && cached.expiresAt > Date.now()) return cached.value

    const value = await factory()
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs })
    return value
  }

  static forget(keyPrefix: string) {
    for (const key of this.entries.keys()) {
      if (key.startsWith(keyPrefix)) this.entries.delete(key)
    }
  }
}

