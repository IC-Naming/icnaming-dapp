export interface ILocalCache {
  getCurrentBucket: () => string;
  setCurrentBucket: (bucket: string) => Promise<void>;
  set: (key: string, value: any, ttl?: number) => Promise<void>;
  get: (key: string) => Promise<any>;
  delete: (key: string) => Promise<void>;
  flush: (expired: boolean) => Promise<void>;
  flushBucket: (expired: boolean, bucket?: string) => Promise<void>;
  buckets: () => Promise<Array<string>>;
}
