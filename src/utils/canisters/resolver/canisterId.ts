import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getResolverId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("r7inp-6aaaa-aaaaa-aaabq-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("uzy66-pqaaa-aaaal-qaalq-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("7hkzn-aaaaa-aaaal-aaazq-cai");
  }
  throw new Error("Unknown environment");
};
export const RESOLVER_ID = getResolverId();
