import { FAVORITE_ID } from './favorites/canisterId';
import { REGISTRAR_ID } from './registrar/canisterId';
import { REGISTRY_ID } from './registry/canisterId';
import { RESOLVER_ID } from './resolver/canisterId';
import { WHITE_LIST_CANISTER_ID } from './whiteList/canisterId';
import { IC_NNS_ID } from './nns/canisterId';
export const whietLists = () => {
  return [
  FAVORITE_ID.toText(),
  REGISTRAR_ID.toText(),
  REGISTRY_ID.toText(),
  RESOLVER_ID.toText(),
  IC_NNS_ID.toText(),
  WHITE_LIST_CANISTER_ID.toText()
]}