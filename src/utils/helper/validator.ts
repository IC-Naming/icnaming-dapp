import { Principal } from "@dfinity/principal";
import { Buffer } from "buffer";
import { calculateCrc32 } from "./converter";

const validICPAccountId = (accountId: string): boolean => {
  const bytes = Buffer.from(accountId, "hex");
  const crcSum = bytes.slice(0, 4);
  const hash = bytes.slice(4, bytes.length);
  const checksum = calculateCrc32(hash);
  return crcSum.equals(checksum);
};
const validator = require("multicoin-address-validator");

// enum address type
const validICPAddress = (address: string): boolean => {
  try {
    Principal.fromText(address);
    return true;
  } catch {
    try {
      return validICPAccountId(address);
    } catch {
      return false;
    }
  }
};

// is valid address
const isValidAddress = (address: string, coin: string) => {
  if(address === ''){
    return true;
  }else if (validator.findCurrency(coin)) {
    return validator.validate(address, coin);
  }
  switch (coin.toUpperCase()) {
    case "ICP":
      return validICPAddress(address);
    default:
      throw new Error("Unknown address type");
  }
};

const isEmail = (email: string) => {
  if (email !== "") {
    const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return reg.test(email);
  }
  return true;
};

export { isValidAddress, isEmail };
