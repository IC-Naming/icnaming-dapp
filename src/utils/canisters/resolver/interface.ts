import type { Principal } from '@dfinity/principal';
export interface ErrorInfo { 'code' : number, 'message' : string }
export type Result = { 'Ok' : boolean } |
  { 'Err' : ErrorInfo };
export type Result_1 = { 'Ok' : Array<[string, string]> } |
  { 'Err' : ErrorInfo };
export interface _SERVICE {
  'ensure_resolver_created' : (arg_0: string) => Promise<Result>,
  'get_record_value' : (arg_0: string) => Promise<Result_1>,
  'set_record_value' : (
      arg_0: string,
      arg_1: Array<[string, string]>,
    ) => Promise<Result>,
}
