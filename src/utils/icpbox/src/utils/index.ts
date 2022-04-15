import JsonBigInt from "json-bigint";
import { BinaryBlob } from "../types";

import { sha256 as jsSha256 } from "js-sha256";

export type RequestId = BinaryBlob & { __requestId__: void };

/**
 * sha256 hash the provided Buffer
 * @param data - input to hash function
 */
export function hash(data: ArrayBuffer): ArrayBuffer {
  return jsSha256.create().update(new Uint8Array(data)).arrayBuffer();
}

// eslint-disable-next-line
export const recursiveParseBigint = (obj) =>
  JsonBigInt.parse(JsonBigInt.stringify(obj));
