
export const isBTCAddress = (address: string) => {
  if (address.length !== 34) {
    return false;
  }
  if (address.slice(0, 2) !== 'bc') {
    return false;
  }
  return true;
};
export const isETHAddress = (address: string) => {
  if (address.length !== 42) {
    return false;
  }
  if (address.slice(0, 2) !== '0x') {
    return false;
  }
  return true;
};
export const isLTCAddress = (address: string) => {
  if (address.length !== 34) {
    return false;
  }
  if (address.slice(0, 2) !== 'lt') {
    return false;
  }
  return true;
};

export const isEmail = (email: string) => {
  const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  return reg.test(email);
}