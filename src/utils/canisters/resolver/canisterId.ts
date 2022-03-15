import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getResolverId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("r7inp-6aaaa-aaaaa-aaabq-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("cwo4k-6aaaa-aaaam-aacba-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("okpdp-caaaa-aaaal-qac6q-cai");
  }
  throw new Error("Unknown environment");
};
export const RESOLVER_ID = getResolverId();
