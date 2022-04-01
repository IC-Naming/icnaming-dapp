import { ILocalCache } from "./ILocalCache";
import { IndexedDBCache } from "./Providers/IndexedDBProvider";
import { SessionStorageCache } from "./Providers/SessionStorageProvider";

enum CacheType {
  IndexedDB = 1,
  SessionStorage = 2,
  LocalStorage = 4,
}

class LocalCache implements ILocalCache {
  private cache?: ILocalCache;
  private fallbackCache?: ILocalCache;
  constructor(
    ttl?: number,
    cacheType?: CacheType,
    fallbackCacheType?: CacheType
  ) {
    switch (cacheType) {
      case undefined:
      case CacheType.IndexedDB:
        const _window: any = (typeof window !== "undefined" && window) || null;
        const _indexedDB =
          indexedDB ||
          (_window &&
            (_window.indexedDB ||
              _window.webkitIndexedDB ||
              _window.mozIndexedDB));

        if (_indexedDB) this.cache = new IndexedDBCache(ttl);
        break;
      case CacheType.SessionStorage:
        if (sessionStorage) this.cache = new SessionStorageCache(ttl);
        break;
      default:
        break;
    }
    switch (fallbackCacheType) {
      case undefined:
      case CacheType.SessionStorage:
        if (sessionStorage) this.fallbackCache = new SessionStorageCache(ttl);
        break;
      default:
        break;
    }
  }
  getCurrentBucket = () => this._cache().getCurrentBucket();
  setCurrentBucket = (bucket: string) => this._cache().setCurrentBucket(bucket);
  set = (key: string, value: any, ttl?: number) =>
    this._cache().set(key, value, ttl);
  get = (key: string) => this._cache().get(key);
  delete = (key: string) => this._cache().delete(key);
  flush = (expired: boolean) => this._cache().flush(expired);
  flushBucket = (expired: boolean, bucket?: string | undefined) =>
    this._cache().flushBucket(expired, bucket);
  buckets = () => this._cache().buckets();

  private _cache = () => {
    const provider = this.cache || this.fallbackCache;
    if (!provider) throw new Error("browser not supported");
    return provider;
  };
}
const CACHE_BUCKET = "__local_cache_bkt";
const cache = new LocalCache();
cache.setCurrentBucket(CACHE_BUCKET);
//cache key generate rule : cacheKey = pageName + uniqueKeyInPage
export const queryWithCache = async (
  query: () => Promise<any>,
  cacheKey: string,
  ttl?: number
) => {
  const cacheItem = await cache.get(cacheKey);
  if (cacheItem) return cacheItem;

  const item = await query();
  if (item) await cache.set(cacheKey, item, ttl);
  return item;
};

export const deleteCache = async (
  cacheKey: string
) => {
  await cache.delete(cacheKey);
}

export const flushCache = async () => {
  await cache.flush(true);
}

export const flushCacheBucket = async (
  expired: boolean,
  bucket?: string
) => {
  await cache.flushBucket(expired, bucket);
}
