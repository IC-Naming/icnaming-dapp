import type { Principal } from '@dfinity/principal';
export interface ErrorInfo { 'code' : number, 'message' : string }
export interface GetNameOrderResponse {
  'status' : NameOrderStatus,
  'payment_memo' : PaymentMemo,
  'name' : string,
  'price_icp_in_e8s' : bigint,
  'payment_account_id' : string,
  'quota_type' : QuotaType,
  'payment_id' : bigint,
  'created_user' : Principal,
  'years' : number,
}
export interface GetPageInput { 'offset' : bigint, 'limit' : bigint }
export interface GetPageOutput { 'items' : Array<RegistrationDto> }
export type NameOrderStatus = { 'New' : null } |
  { 'WaitingToRefund' : null } |
  { 'Done' : null } |
  { 'Canceled' : null };
export type PaymentMemo = { 'ICP' : bigint };
export type QuotaType = { 'LenEq' : number } |
  { 'LenGte' : number };
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
export type Result_1 = { 'Ok' : Array<RegistrationDetails> } |
  { 'Err' : ErrorInfo };
export type Result_2 = { 'Ok' : RegistrationDetails } |
  { 'Err' : ErrorInfo };
export type Result_3 = { 'Ok' : bigint } |
  { 'Err' : ErrorInfo };
export type Result_4 = { 'Ok' : GetPageOutput } |
  { 'Err' : ErrorInfo };
export type Result_5 = { 'Ok' : Principal } |
  { 'Err' : ErrorInfo };
export type Result_6 = { 'Ok' : [] | [GetNameOrderResponse] } |
  { 'Err' : ErrorInfo };
export type Result_7 = { 'Ok' : number } |
  { 'Err' : ErrorInfo };
export type Result_8 = { 'Ok' : Stats } |
  { 'Err' : ErrorInfo };
export type Result_9 = { 'Ok' : SubmitOrderResponse } |
  { 'Err' : ErrorInfo };
export interface Stats {
  'new_registered_name_count' : bigint,
  'last_xdr_permyriad_per_icp' : bigint,
  'name_order_cancelled_count' : bigint,
  'name_order_placed_count' : bigint,
  'name_order_paid_count' : bigint,
  'user_name_order_count_by_status' : Array<[string, bigint]>,
  'last_timestamp_seconds_xdr_permyriad_per_icp' : bigint,
  'payment_version' : bigint,
  'user_quota_order_count' : Array<[string, bigint]>,
  'last_ledger_sync_timestamp_nanos' : bigint,
  'registration_count' : bigint,
}
export interface SubmitOrderRequest { 'name' : string, 'years' : number }
export interface SubmitOrderResponse { 'order' : GetNameOrderResponse }
export interface _SERVICE {
  'add_quota' : (arg_0: Principal, arg_1: QuotaType, arg_2: number) => Promise<
      Result
    >,
  'available' : (arg_0: string) => Promise<Result>,
  'cancel_order' : () => Promise<Result>,
  'get_all_details' : (arg_0: GetPageInput) => Promise<Result_1>,
  'get_details' : (arg_0: string) => Promise<Result_2>,
  'get_name_expires' : (arg_0: string) => Promise<Result_3>,
  'get_names' : (arg_0: Principal, arg_1: GetPageInput) => Promise<Result_4>,
  'get_owner' : (arg_0: string) => Promise<Result_5>,
  'get_pending_order' : () => Promise<Result_6>,
  'get_quota' : (arg_0: Principal, arg_1: QuotaType) => Promise<Result_7>,
  'get_stats' : () => Promise<Result_8>,
  'refund_order' : () => Promise<Result>,
  'register_for' : (arg_0: string, arg_1: Principal, arg_2: bigint) => Promise<
      Result
    >,
  'register_with_quota' : (arg_0: string, arg_1: QuotaType) => Promise<Result>,
  'sub_quota' : (arg_0: Principal, arg_1: QuotaType, arg_2: number) => Promise<
      Result
    >,
  'submit_order' : (arg_0: SubmitOrderRequest) => Promise<Result_9>,
}
