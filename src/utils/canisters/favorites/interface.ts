import type { Principal } from '@dfinity/principal';
export interface ErrorInfo { 'code' : number, 'message' : string }
export type Result = { 'Ok' : boolean } |
  { 'Err' : ErrorInfo };
export type Result_1 = { 'Ok' : Array<string> } |
  { 'Err' : ErrorInfo };
export interface _SERVICE {
  'add_favorite' : (arg_0: string) => Promise<Result>,
  'get_favorites' : () => Promise<Result_1>,
  'remove_favorite' : (arg_0: string) => Promise<Result>,
}
