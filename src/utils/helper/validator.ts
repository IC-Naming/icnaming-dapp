import { Principal } from "@dfinity/principal";
const validator = require("multicoin-address-validator");

// enum address type

const validICPAddress = (address: string): boolean => {
  try {
    Principal.fromText(address);
    return true;
  } catch {
    return false;
  }
};

// is valid address
export const isValidAddress = (address: string, coin: string) => {
  if (validator.findCurrency(coin)) {
    return validator.validate(address, coin);
  }
  switch (coin.toUpperCase()) {
    case "ICP":
      return validICPAddress(address);
    default:
      throw new Error("Unknown address type");
  }
};

export const isEmail = (email: string) => {
  if (email !== "") {
    const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return reg.test(email);
  }
  return true;
};
