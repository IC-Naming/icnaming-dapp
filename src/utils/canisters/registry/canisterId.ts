import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getRegistryId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("chqy6-eiaaa-aaaak-qabja-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("uilf4-iqaaa-aaaam-qaava-cai");
  }
  throw new Error("Unknown environment");
};
export const REGISTRY_ID = getRegistryId();
