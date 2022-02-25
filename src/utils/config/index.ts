import { IC_LOCAL_HOST, IC_MAINNET_HOST } from "./constants";
import { isLocalEnv } from "./env";
const IC_HOST = isLocalEnv() ? IC_LOCAL_HOST : IC_MAINNET_HOST;
export * from "./env";
export { IC_HOST };
export * from "./constants";
