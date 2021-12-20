import { ILocalCache } from "../ILocalCache";
import { SessionStorageCache } from "./SessionStorageProvider";

describe("SessionStorageCache", () => {
  let globalLocalCache: ILocalCache;
  const testBucketName = "test_bucket_name";
  const testBucketName2 = "test_bucket_name2";
  const cacheKey = "__test_cache_key";
  const cacheVal = { test: "just test", value: 1 };
  const cacheKey2 = "__test_cache_key2";
  const cacheVal2 = { test: "just test2", value: 2 };
  const ttl = 100;
  const delay = (ms) =>
    new Promise((resolve, reject) => setTimeout(resolve, ms));

  beforeEach(async () => {
    globalLocalCache = new SessionStorageCache(ttl);
    await globalLocalCache.setCurrentBucket(testBucketName);
  });

  describe("test cache set and get", () => {
    it("should create local cache with correct bucket name", async () => {
      expect(await globalLocalCache.getCurrentBucket()).toEqual(testBucketName);
      expect(await globalLocalCache.buckets()).toEqual([testBucketName]);
      await globalLocalCache.setCurrentBucket(testBucketName2);
      expect(await globalLocalCache.getCurrentBucket()).toEqual(
        testBucketName2
      );
      expect(await globalLocalCache.buckets()).toEqual([
        testBucketName,
        testBucketName2,
      ]);
    });

    it("should get the set value in cache", async () => {
      await globalLocalCache.set(cacheKey, cacheVal, ttl);
      await globalLocalCache.set(cacheKey2, cacheVal2, ttl);
      expect(await globalLocalCache.get(cacheKey)).toEqual(cacheVal);
      expect(await globalLocalCache.get(cacheKey2)).toEqual(cacheVal2);
    });

    it("should get null when delete key in cache", async () => {
      await globalLocalCache.set(cacheKey, cacheVal, ttl);
      await globalLocalCache.set(cacheKey2, cacheVal2, ttl);
      expect(await globalLocalCache.get(cacheKey)).toEqual(cacheVal);
      expect(await globalLocalCache.get(cacheKey2)).toEqual(cacheVal2);
      await globalLocalCache.delete(cacheKey);
      await globalLocalCache.delete(cacheKey2);
      expect(await globalLocalCache.get(cacheKey)).toEqual(null);
      expect(await globalLocalCache.get(cacheKey2)).toEqual(null);
    });

    it("should return when switch bucket", async () => {
      await globalLocalCache.set(cacheKey, cacheVal, ttl);
      await globalLocalCache.set(cacheKey2, cacheVal2, ttl);
      await globalLocalCache.setCurrentBucket(testBucketName2);
      expect(await globalLocalCache.get(cacheKey)).toBeNull();
      expect(await globalLocalCache.get(cacheKey2)).toBeNull();
      await globalLocalCache.setCurrentBucket(testBucketName);
      expect(await globalLocalCache.get(cacheKey)).toEqual(cacheVal);
      expect(await globalLocalCache.get(cacheKey2)).toEqual(cacheVal2);
    });

    it("should return null when expired", async () => {
      await globalLocalCache.set(cacheKey, cacheVal, 1);
      setTimeout(async () => {
        expect(await globalLocalCache.get(cacheKey)).toBeNull();
      }, 1001);
      await delay(1002);
    });

    it("should return null after flush bucket", async () => {
      await globalLocalCache.set(cacheKey, cacheVal, ttl);
      await globalLocalCache.set(cacheKey2, cacheVal2, ttl);
      await globalLocalCache.flushBucket(false);
      expect(await globalLocalCache.get(cacheKey)).toBeNull();
      expect(await globalLocalCache.get(cacheKey2)).toBeNull();
    });

    it("should return null after flush", async () => {
      await globalLocalCache.set(cacheKey, cacheVal, ttl);
      await globalLocalCache.flush(false);
      expect(await globalLocalCache.get(cacheKey)).toBeNull();
    });

    it("should return not null value after flush bucket expired", async () => {
      await globalLocalCache.set(cacheKey, cacheVal, ttl);
      await globalLocalCache.set(cacheKey2, cacheVal2, ttl);
      await globalLocalCache.flushBucket(true);
      expect(await globalLocalCache.get(cacheKey)).toEqual(cacheVal);
      expect(await globalLocalCache.get(cacheKey2)).toEqual(cacheVal2);
    });
    it("should return not null value after flush expired", async () => {
      await globalLocalCache.set(cacheKey, cacheVal, ttl);
      await globalLocalCache.flush(true);
      expect(await globalLocalCache.get(cacheKey)).toEqual(cacheVal);
    });
  });
});
