export const TOKEN_RATE_AMPL = 10 ** 8;
export const ICP_TO_CYCLES_AMPL = 10 ** 12;
export const SUB_ACCOUNT_ZERO = Buffer.alloc(32);
export const DEFAULT_SUB_ACCOUNT_ZERO = Array.from(
  new Uint8Array(SUB_ACCOUNT_ZERO)
);
export const ICP_TOKEN_ID = "__icp";
export const ICP_TOKEN_SYMBOL = "ICP";
export const ICP_TOKEN_DECIMALS = 8;

export const IC_MAINNET_HOST = "https://ic0.app";
export const IC_LOCAL_HOST = "http://127.0.0.1:8000";
