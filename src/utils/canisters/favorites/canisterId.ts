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
    // test
    // return Principal.fromText("oyjuw-oqaaa-aaaal-qac5q-cai");
    // main
    return Principal.fromText("crp26-tyaaa-aaaam-aacbq-cai");
  }
  throw new Error("Unknown environment");
};
export const FAVORITE_ID = getFavoriteId();
