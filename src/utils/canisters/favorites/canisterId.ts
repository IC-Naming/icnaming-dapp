import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getFavoriteId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("qjdve-lqaaa-aaaaa-aaaeq-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("gfftf-pqaaa-aaaaj-aadza-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("v2uxy-3iaaa-aaaal-qaana-cai");
  }
  throw new Error("Unknown environment");
};
export const FAVORITE_ID = getFavoriteId();
