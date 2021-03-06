import { ILocalCache, jsonParse, jsonStringify } from "../ILocalCache";
export class LocalStorageCache implements ILocalCache {
  private _prefix = "lsc"; //Prefix for keys
  private BUCKETS_DATA_KEY = `${this._prefix}-buckets`;
  private _cacheExpiryTime = 0; //Amount of time to cache data for in seconds
  private _defaultCacheExpiryTime = 3600; //Amount of time to cache data for in seconds
  private _defaultBucket = "default";
  private _currentBucket = "";
  private _buckets: Array<string> = [];

  constructor(ttl?: number) {
    this._cacheExpiryTime = ttl || this._defaultCacheExpiryTime;
  }
  public delete = async (key: string) => {
    removeItem(this.generateKey(key));
  };
  public get(key) {
    key = this.generateKey(key);

    let item = getItem(key);

    if (!item || removeExpiredItem(key)) {
      return null;
    }
    let { value } = jsonParse(item);
    return value;
  }

  public set = async (key: string, value: any, ttl?: number) => {
    console.log(key);
    const expiryDateInMilliseconds = this.calculateExpiryDate(ttl);
    let valueToSet: any = { value: value, expiry: expiryDateInMilliseconds };

    try {
      valueToSet = jsonStringify(valueToSet);
    } catch (e) {
      console.log(`Couldn't convert value to JSON, e: ${e}`);
    }

    try {
      setItem(this.generateKey(key), valueToSet);
    } catch (e) {
      if (isLocalStorageOutOfSpace(e)) {
        let targetSize = valueToSet.length;
        const storedItems: Array<any> = [];
        this.eachKey((key) => {
          const item = getItem(key);
          if (item) {
            const { expiry } = jsonParse(item);
            storedItems.push({ key, value: item, expiry });
          }
        });
        storedItems.sort((a, b) => a.expiry - b.expiry);

        while (storedItems.length && targetSize > 0) {
          let item = storedItems.shift();
          removeItem(key);
          targetSize -= item.value.length;
        }
        try {
          setItem(this.generateKey(key), valueToSet);
        } catch (e) {
          console.log(`Couldn't add key: ${key} to cache, e: ${e}`);
        }
      } else {
        console.log(`Couldn't add key: ${key} to cache, e: ${e}`);
      }
    }
  };
  public getCurrentBucket = () => {
    return this._currentBucket || this._defaultBucket;
  };

  public setCurrentBucket = async (bucketName) => {
    this.fetchBucketsFromLocalStorage();
    if (!this._buckets.includes(bucketName)) {
      let newBuckets = JSON.stringify([...this._buckets, bucketName]);
      try {
        setItem(this.BUCKETS_DATA_KEY, newBuckets);
        this.fetchBucketsFromLocalStorage();
      } catch (e) {
        console.error("setCurrentBucket failed", e);
      }
    }
    this._currentBucket = bucketName;
  };

  public flush = async (expired = true) => {
    let cb = expired ? removeExpiredItem : removeItem;
    this.eachKey((key) => cb(key));
  };

  public flushBucket = async (expired = true, bucket?: string) => {
    bucket = bucket ?? this._currentBucket;
    let cb = expired ? removeExpiredItem : removeItem;
    this.eachKeyInBucket((key) => cb(key), bucket);
  };
  public buckets = async () => {
    return this._buckets;
  };

  private each(regExp, callback) {
    for (const key in localStorage) {
      if (key.match(regExp)) {
        callback(key);
      }
    }
  }

  private eachKeyInBucket = (callback, bucket) => {
    let regExp = new RegExp(
      `^${this._prefix}-${bucket ?? this._currentBucket}(.*)`
    );
    this.each(regExp, callback);
  };
  private eachKey = (callback) => {
    let regExp = new RegExp(`^${this._prefix}-(.*)`);
    this.each(regExp, callback);
  };

  private generateKey = (key) => {
    return `${this._prefix}${
      this._currentBucket ? `-${this._currentBucket}` : ""
    }-${key}`;
  };

  private fetchBucketsFromLocalStorage = () => {
    let buckets = localStorage.getItem(this.BUCKETS_DATA_KEY);
    if (buckets) {
      this._buckets = jsonParse(buckets);
    } else {
      this._buckets = [];
    }
  };

  private calculateExpiryDate(cacheExpiryTime?: number) {
    let expiry = cacheExpiryTime ?? this._cacheExpiryTime;
    let expiryDateInMilliseconds = new Date(
      Date.now() + expiry * 1000
    ).getTime();
    return expiryDateInMilliseconds;
  }
}

function setItem(key, value) {
  return localStorage.setItem(key, value);
}

function removeItem(key) {
  return localStorage.removeItem(key);
}

function getItem(key) {
  return localStorage.getItem(key);
}

function isExpired(expiryDateInMilliseconds) {
  let currentTime = getCurrentTimeInMS();
  return currentTime >= expiryDateInMilliseconds;
}

function removeExpiredItem(key) {
  let item = getItem(key);
  if (item) {
    let { expiry } = jsonParse(item);
    if (isExpired(expiry)) {
      removeItem(key);
      return true;
    }
  }
}

function isLocalStorageOutOfSpace(e) {
  return (
    e &&
    (e.name === "QUOTA_EXCEEDED_ERR" ||
      e.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      e.name === "QuotaExceededError")
  );
}

function getCurrentTimeInMS() {
  return Date.now();
}
