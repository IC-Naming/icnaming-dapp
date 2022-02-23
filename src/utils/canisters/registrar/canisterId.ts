import { Principal } from "@dfinity/principal";
import { isLocalEnv, isMainNetEnv, isTestNetEnv } from "../../config";
const getRegistrarId = (): Principal => {
  if (isLocalEnv()) {
    return Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
  }
  if (isMainNetEnv()) {
    return Principal.fromText("j6dzz-gaaaa-aaaak-aab3q-cai");
  }
  if (isTestNetEnv()) {
    return Principal.fromText("onof3-pyaaa-aaaal-qac6a-cai");
  }
  throw new Error("Unknown environment");
};
export const REGISTRAR_ID = getRegistrarId();
