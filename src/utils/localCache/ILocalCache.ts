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

export const jsonStringify = (value: any) => {
  try {
    return JSON.stringify(value, (key, value) =>
      typeof value === "bigint" ? value.toString() + "n" : value
    );
  } catch (e) {
    console.log(`Couldn't convert value to JSON, e: ${e}`);
  }
};
export const jsonParse = (json: any) => {
  try {
    return JSON.parse(json, (key, v) => {
      if (typeof v === "string" && /^\d+n$/.test(v)) {
        return BigInt(v.substr(0, v.length - 1));
      }
      return v;
    });
  } catch (e) {
    console.log(`Couldn't parse value, e: ${e}`);
  }
};
