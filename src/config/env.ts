
let env = 'prod';
if(window.location.hostname === 'localhost') {
  env = 'local';
}
export default env;
export const isLocalEnv = env === 'local';