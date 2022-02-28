import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getNNSId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("qoctq-giaaa-aaaaa-aaaea-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("qoctq-giaaa-aaaaa-aaaea-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("qoctq-giaaa-aaaaa-aaaea-cai");
  }
  throw new Error("Unknown environment");
};

export const IC_NNS_ID = getNNSId();
