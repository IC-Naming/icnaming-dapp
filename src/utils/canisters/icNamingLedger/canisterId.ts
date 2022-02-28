import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getICNamingLedgerId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("ceilt-sqaaa-aaaam-aacca-cai");
  }
  if (isTestNetEnv()) {
    // test
    // return Principal.fromText("ra2t7-3aaaa-aaaaj-aahzq-cai");
    // main
    return Principal.fromText("ceilt-sqaaa-aaaam-aacca-cai");
  }
  throw new Error("Unknown environment");
};

export const IC_NAMING_LEDGER_ID = getICNamingLedgerId();
