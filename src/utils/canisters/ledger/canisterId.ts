import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getLedgerId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  }
  throw new Error("Unknown environment");
};

export const IC_LEDGER_ID = getLedgerId();
