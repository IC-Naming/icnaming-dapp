import { Buffer } from "buffer/";
import { PipeArrayBuffer as Pipe } from "./utils/buffer";

export type BinaryBlob = any;
export type DerEncodedBlob = any;

export function blobFromHex(hex) {
  return Buffer.from(hex, "hex");
}

export function derBlobFromBlob(blob) {
  return blob;
}

export function blobFromUint8Array(arr) {
  return Buffer.from(arr);
}

export function blobFromBuffer(b) {
  return b;
}

/**
 * Encode a positive number (or bigint) into a Buffer. The number will be floored to the
 * nearest integer.
 * @param value The number to encode.
 */
export function lebEncode(value: bigint | number): ArrayBuffer {
  if (typeof value === "number") {
    value = BigInt(value);
  }

  if (value < BigInt(0)) {
    throw new Error("Cannot leb encode negative values.");
  }

  const byteLength =
    (value === BigInt(0) ? 0 : Math.ceil(Math.log2(Number(value)))) + 1;
  const pipe = new Pipe(new ArrayBuffer(byteLength), 0);
  while (true) {
    const i = Number(value & BigInt(0x7f));
    value /= BigInt(0x80);
    if (value === BigInt(0)) {
      pipe.write(new Uint8Array([i]));
      break;
    } else {
      pipe.write(new Uint8Array([i | 0x80]));
    }
  }

  return pipe.buffer;
}

export function blobToHex(blob) {
  return blob.toString("hex");
}
