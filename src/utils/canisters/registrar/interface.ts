import type { Principal } from '@dfinity/principal';
export interface ErrorInfo { 'code' : number, 'message' : string }
export interface GetPageInput { 'offset' : bigint, 'limit' : bigint }
export interface GetPageOutput { 'items' : Array<RegistrationDto> }
export interface RegistrationDetails {
  'owner' : Principal,
  'name' : string,
  'created_at' : bigint,
  'expired_at' : bigint,
}
export interface RegistrationDto {
  'name' : string,
  'created_at' : bigint,
  'expired_at' : bigint,
}
export type Result = { 'Ok' : boolean } |
  { 'Err' : ErrorInfo };
export type Result_1 = { 'Ok' : RegistrationDetails } |
  { 'Err' : ErrorInfo };
export type Result_2 = { 'Ok' : bigint } |
  { 'Err' : ErrorInfo };
export type Result_3 = { 'Ok' : GetPageOutput } |
  { 'Err' : ErrorInfo };
export type Result_4 = { 'Ok' : Principal } |
  { 'Err' : ErrorInfo };
export interface _SERVICE {
  'available' : (arg_0: string) => Promise<Result>,
  'get_details' : (arg_0: string) => Promise<Result_1>,
  'get_name_expires' : (arg_0: string) => Promise<Result_2>,
  'get_names' : (arg_0: Principal, arg_1: GetPageInput) => Promise<Result_3>,
  'get_owner' : (arg_0: string) => Promise<Result_4>,
  'register_for' : (arg_0: string, arg_1: Principal, arg_2: bigint) => Promise<
      Result
    >,
}
