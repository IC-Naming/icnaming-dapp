import { ILocalCache } from "../ILocalCache";
export class IndexedDBCache implements ILocalCache {
  private _prefix = "idb"; //Prefix for keys
  private BUCKETS_DATA_KEY = `${this._prefix}-buckets`;
  private _cacheExpiryTime = 0; //Amount of time to cache data for in seconds
  private _defaultCacheExpiryTime = 3600; //Amount of time to cache data for in seconds
  private _defaultBucket = "";
  private _currentBucket = "";
  private _buckets: Array<string> = [];
  private _db: any;

  constructor(ttl?: number) {
    this._cacheExpiryTime = ttl || this._defaultCacheExpiryTime;
  }
  public get = async (key) => {
    key = this.generateKey(key);

    try {
      const storeName = this.generateStoreName(this._currentBucket);
      let item = await getItem(this._db, storeName, key);

      if (!item) return null;

      let { expiry } = JSON.parse(item);
      if (isExpired(expiry)) {
        removeItem(this._db, storeName, key);
        return null;
      }

      let { value } = JSON.parse(item as string);
      return value;
    } catch (e) {
      console.log("indexdb cache get failed", e);
    }
  };

  public set = async (key: string, value: any, ttl?: number) => {
    const expiryDateInMilliseconds = this.calculateExpiryDate(ttl);
    let valueToSet: any = { value: value, expiry: expiryDateInMilliseconds };

    try {
      valueToSet = JSON.stringify(valueToSet);
    } catch (e) {
      console.log(`Couldn't convert value to JSON, e: ${e}`);
    }

    const storeName = this.generateStoreName(this._currentBucket);
    try {
      await setItem(this._db, storeName, this.generateKey(key), valueToSet);
    } catch (e) {
      console.log("indexdb cache set failed", e);
    }
  };
  public getCurrentBucket = () => {
    return this._currentBucket || this._defaultBucket;
  };

  public setCurrentBucket = async (bucketName) => {
    try {
      this.fetchBucketsFromLocalStorage();
      const storeName = this.generateStoreName(bucketName);
      const db = await this.getCacheStorage(storeName);
      this._db = db;
      this._currentBucket = bucketName;
      if (!this._buckets.includes(bucketName)) {
        let newBuckets = JSON.stringify([...this._buckets, bucketName]);
        try {
          localStorage.setItem(this.BUCKETS_DATA_KEY, newBuckets);
          this.fetchBucketsFromLocalStorage();
        } catch (e) {
          console.error("setCurrentBucket (create store) failed", e);
        }
      }
    } catch (e) {
      console.log("setCurrentBucket failed", e);
    }
  };

  public flush = async (expired = true) => {
    return new Promise<void>((resolve, reject) => {
      for (
        let bucketIndex = 0;
        bucketIndex < this._buckets.length;
        bucketIndex++
      ) {
        const bucket = this._buckets[bucketIndex];

        const storeName = this.generateStoreName(bucket);
        if (this._db.objectStoreNames.contains(storeName)) {
          const bucketStore = this._db
            .transaction([storeName], "readwrite")
            .objectStore(storeName);
          const req = bucketStore.getAllKeys();
          req.onsuccess = (e) => {
            const remove = expired ? removeExpiredItem : removeItem;

            for (let index = 0; index < e.target.result.length; index++) {
              const key = e.target.result[index];
              remove(this._db, storeName, key);
            }
          };
          req.onerror = (e) => {
            reject(e);
          };
        }

        resolve();
      }
    });
  };

  public flushBucket = (expired = true, bucket?: string) => {
    const bucketName = bucket ?? this._currentBucket;

    const storeName = this.generateStoreName(bucketName);
    return new Promise<void>(async (resolve, reject) => {
      const bucketStore = this._db
        .transaction([storeName], "readwrite")
        .objectStore(storeName);
      const req = bucketStore.getAllKeys();
      req.onsuccess = (e) => {
        const remove = expired ? removeExpiredItem : removeItem;

        for (let index = 0; index < e.target.result.length; index++) {
          const key = e.target.result[index];
          remove(this._db, storeName, key);
        }

        resolve();
      };
      req.onerror = (e) => {
        reject(e);
      };
    });
  };
  public buckets = async () => {
    return this._buckets;
  };

  private generateKey = (key) => {
    return `${this._prefix}${
      this._currentBucket ? `-${this._currentBucket}` : ""
    }-${key}`;
  };

  private generateStoreName = (bucket) => {
    return `${this._prefix}_${bucket}`;
  };

  private fetchBucketsFromLocalStorage = () => {
    let buckets = localStorage.getItem(this.BUCKETS_DATA_KEY);
    if (buckets) {
      this._buckets = JSON.parse(buckets);
    } else {
      this._buckets = [];
    }
  };

  private calculateExpiryDate(cacheExpiryTime?:number) {
    let expiry = cacheExpiryTime ?? this._cacheExpiryTime;
    let expiryDateInMilliseconds = new Date(
      Date.now() + expiry * 1000
    ).getTime();
    return expiryDateInMilliseconds;
  }

  private getCacheStorage = (storeName) => {
    return new Promise(function (resolve, reject) {
      const _window: any = (typeof window !== "undefined" && window) || null;
      const _indexedDB =
        indexedDB ||
        (_window &&
          (_window.indexedDB ||
            _window.webkitIndexedDB ||
            _window.mozIndexedDB));

      const req = _indexedDB.open(storeName, 1);
      req.onerror = (event) => reject(event);
      req.onupgradeneeded = function (event: any) {
        let db = event.target.result;
        if (db.objectStoreNames.contains(storeName)) resolve(db);
        db.createObjectStore(storeName, { keyPath: "key" });
      };
      req.onsuccess = (event) => {
        resolve(req.result);
      };
    });
  };
}

function setItem(db, bucket, key, value) {
  return new Promise<void>((resolve, reject) => {
    const req = db
      .transaction([bucket], "readwrite")
      .objectStore(bucket)
      .put({ key, value });
    req.onsuccess = (event) => {
      resolve();
    };
    req.onerror = (event) => {
      console.log("indexed db put item error");
      reject(event);
    };
  });
}

function removeItem(db, bucket, key) {
  return new Promise<void>((resolve, reject) => {
    const req = db
      .transaction([bucket], "readwrite")
      .objectStore(bucket)
      .delete(key);
    req.onsuccess = (event) => {
      resolve();
    };
    req.onerror = (event) => {
      console.log("indexed db delete item error");
      reject(event);
    };
  });
}

function getItem(db, bucket, key) {
  return new Promise<string>((resolve, reject) => {
    const req = db
      .transaction([bucket], "readwrite")
      .objectStore(bucket)
      .get(key);
    req.onsuccess = (event) => {
      if (req.result) resolve(req.result.value as string);
      else {
        resolve("");
      }
    };
    req.onerror = (event) => {
      console.log("indexed db get item error");
      reject(event);
    };
  });
}

function isExpired(expiryDateInMilliseconds) {
  let currentTime = getCurrentTimeInMS();
  return currentTime >= expiryDateInMilliseconds;
}

function removeExpiredItem(db, bucket, key) {
  return new Promise<boolean>(async (resolve, reject) => {
    const item: any = await getItem(db, bucket, key);
    if (item) {
      let { expiry } = JSON.parse(item);
      if (isExpired(expiry)) {
        removeItem(db, bucket, key);
        return true;
      }
    }
    return false;
  });
}

function getCurrentTimeInMS() {
  return Date.now();
}
