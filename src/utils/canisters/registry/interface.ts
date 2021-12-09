import type { Principal } from '@dfinity/principal';
export interface ErrorInfo { 'code' : number, 'message' : string }
export interface GetPageInput { 'offset' : bigint, 'limit' : bigint }
export interface GetPageOutput { 'items' : Array<string> }
export interface RegistryDto {
  'ttl' : bigint,
  'resolver' : Principal,
  'owner' : Principal,
  'name' : string,
}
export interface RegistryUsers {
  'owner' : Principal,
  'operators' : Array<Principal>,
}
export type Result = { 'Ok' : GetPageOutput } |
  { 'Err' : ErrorInfo };
export type Result_1 = { 'Ok' : RegistryDto } |
  { 'Err' : ErrorInfo };
export type Result_2 = { 'Ok' : Principal } |
  { 'Err' : ErrorInfo };
export type Result_3 = { 'Ok' : bigint } |
  { 'Err' : ErrorInfo };
export type Result_4 = { 'Ok' : RegistryUsers } |
  { 'Err' : ErrorInfo };
export type Result_5 = { 'Ok' : boolean } |
  { 'Err' : ErrorInfo };
export interface _SERVICE {
  'get_controlled_names' : (arg_0: Principal, arg_1: GetPageInput) => Promise<
      Result
    >,
  'get_details' : (arg_0: string) => Promise<Result_1>,
  'get_owner' : (arg_0: string) => Promise<Result_2>,
  'get_resolver' : (arg_0: string) => Promise<Result_2>,
  'get_ttl' : (arg_0: string) => Promise<Result_3>,
  'get_users' : (arg_0: string) => Promise<Result_4>,
  'set_approval' : (arg_0: string, arg_1: Principal, arg_2: boolean) => Promise<
      Result_5
    >,
  'set_record' : (arg_0: string, arg_1: bigint, arg_2: Principal) => Promise<
      Result_5
    >,
  'set_subdomain_owner' : (
      arg_0: string,
      arg_1: string,
      arg_2: Principal,
      arg_3: bigint,
      arg_4: Principal,
    ) => Promise<Result_1>,
  'set_top_name' : () => Promise<Result_5>,
}
