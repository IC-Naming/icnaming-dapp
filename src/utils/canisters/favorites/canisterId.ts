import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getFavoriteId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("qjdve-lqaaa-aaaaa-aaaeq-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("crp26-tyaaa-aaaam-aacbq-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("oyjuw-oqaaa-aaaal-qac5q-cai");
  }
  throw new Error("Unknown environment");
};
export const FAVORITE_ID = getFavoriteId();
