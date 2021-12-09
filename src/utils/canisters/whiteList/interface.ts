import type { Principal } from '@dfinity/principal';
export interface Error { 'code' : number, 'message' : string }
export interface RefStatus { 'ref_count' : bigint, 'credit' : bigint }
export type Result = { 'Ok' : boolean } |
  { 'Err' : Error };
export type Result_1 = { 'Ok' : RefStatus } |
  { 'Err' : Error };
export interface WhiteListInfo {
  'credit_remain' : bigint,
  'ens_white_list_end_date' : bigint,
  'ens_white_list_count' : bigint,
  'nns_staking_list_count' : bigint,
  'nns_staking_list_end_date' : bigint,
  'icnaming_canister_id' : Principal,
}
export interface _SERVICE {
  'addToENSWhiteList' : (
      arg_0: string,
      arg_1: string,
      arg_2: string,
    ) => Promise<Result>,
  'addToNNSWhiteList' : (arg_0: Principal) => Promise<Result>,
  'getWhiteListInfo' : () => Promise<WhiteListInfo>,
  'icnaming' : () => Promise<Principal>,
  'isInWhiteList' : (arg_0: string, arg_1: string) => Promise<Result>,
  'owner' : () => Promise<Principal>,
  'refStatus' : (arg_0: string) => Promise<Result_1>,
  'regName' : (arg_0: string, arg_1: string) => Promise<Result>,
  'setCreditLimit' : (arg_0: bigint) => Promise<Result>,
  'setICNaming' : (arg_0: Principal) => Promise<Result>,
  'setOwner' : (arg_0: Principal) => Promise<Result>,
}
