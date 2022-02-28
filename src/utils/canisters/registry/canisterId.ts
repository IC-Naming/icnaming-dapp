import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getRegistryId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("c7nxw-iiaaa-aaaam-aacaq-cai");
  }
  if (isTestNetEnv()) {
    // test
    // return Principal.fromText("cxnwn-diaaa-aaaag-aabaq-cai");
    // main
    return Principal.fromText("c7nxw-iiaaa-aaaam-aacaq-cai");
  }
  throw new Error("Unknown environment");
};
export const REGISTRY_ID = getRegistryId();
