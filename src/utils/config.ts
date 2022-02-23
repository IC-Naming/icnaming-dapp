const IC_MAINNET_HOST = "https://ic0.app";
const IC_LOCAL_HOST = "http://127.0.0.1:8000";
const isLocalEnv = (): boolean => {
  return process.env.REACT_APP_ENV === "Local";
};
const isTestNetEnv = (): boolean => {
  return process.env.REACT_APP_ENV === "TestNet";
};
const isMainNetEnv = (): boolean => {
  return process.env.REACT_APP_ENV === "MainNet";
};

const WHITE_LIST_PROXY_API = isMainNetEnv()
  ? "https://xnks09f3ib.execute-api.ap-east-1.amazonaws.com/prod/reg"
  : "https://x5rs4e3ht9.execute-api.ap-east-1.amazonaws.com/dev/reg";
const IC_HOST = isLocalEnv() ? IC_LOCAL_HOST : IC_MAINNET_HOST;
const IC_EXTENSION = isTestNetEnv() || isLocalEnv() ? "ticp" : "icp";
export {
  IC_HOST,
  WHITE_LIST_PROXY_API,
  IC_EXTENSION,
  isLocalEnv,
  isTestNetEnv,
  isMainNetEnv,
};
