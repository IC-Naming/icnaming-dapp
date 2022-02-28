const isLocalEnv = (): boolean => {
  return process.env.REACT_APP_ENV === "Local";
};
const isTestNetEnv = (): boolean => {
  return process.env.REACT_APP_ENV === "TestNet";
};
const isMainNetEnv = (): boolean => {
  return process.env.REACT_APP_ENV === "MainNet";
};

export { isLocalEnv, isTestNetEnv, isMainNetEnv };
