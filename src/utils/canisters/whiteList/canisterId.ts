import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getWhiteListCanisterId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("7snia-biaaa-aaaal-aaa2a-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("zo36k-iqaaa-aaaaj-qahdq-cai");
  }
  throw new Error("Unknown environment");
};
export const WHITE_LIST_CANISTER_ID = getWhiteListCanisterId();
