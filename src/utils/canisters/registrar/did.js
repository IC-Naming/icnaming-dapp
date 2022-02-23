export const idlFactory = ({ IDL }) => {
  const QuotaType = IDL.Variant({ 'LenEq' : IDL.Nat8, 'LenGte' : IDL.Nat8 });
  const ErrorInfo = IDL.Record({ 'code' : IDL.Nat32, 'message' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : ErrorInfo });
  const GetPageInput = IDL.Record({
    'offset' : IDL.Nat64,
    'limit' : IDL.Nat64,
  });
  const RegistrationDetails = IDL.Record({
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'expired_at' : IDL.Nat64,
  });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Vec(RegistrationDetails),
    'Err' : ErrorInfo,
  });
  const Result_2 = IDL.Variant({
    'Ok' : RegistrationDetails,
    'Err' : ErrorInfo,
  });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : ErrorInfo });
  const RegistrationDto = IDL.Record({
    'name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'expired_at' : IDL.Nat64,
  });
  const GetPageOutput = IDL.Record({ 'items' : IDL.Vec(RegistrationDto) });
  const Result_4 = IDL.Variant({ 'Ok' : GetPageOutput, 'Err' : ErrorInfo });
  const Result_5 = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : ErrorInfo });
  const NameOrderStatus = IDL.Variant({
    'New' : IDL.Null,
    'WaitingToRefund' : IDL.Null,
    'Done' : IDL.Null,
    'Canceled' : IDL.Null,
  });
  const PaymentMemo = IDL.Variant({ 'ICP' : IDL.Nat64 });
  const GetNameOrderResponse = IDL.Record({
    'status' : NameOrderStatus,
    'payment_memo' : PaymentMemo,
    'name' : IDL.Text,
    'price_icp_in_e8s' : IDL.Nat,
    'payment_account_id' : IDL.Text,
    'quota_type' : QuotaType,
    'payment_id' : IDL.Nat64,
    'created_user' : IDL.Principal,
    'years' : IDL.Nat32,
  });
  const Result_6 = IDL.Variant({
    'Ok' : IDL.Opt(GetNameOrderResponse),
    'Err' : ErrorInfo,
  });
  const Result_7 = IDL.Variant({ 'Ok' : IDL.Nat32, 'Err' : ErrorInfo });
  const Stats = IDL.Record({
    'new_registered_name_count' : IDL.Nat64,
    'last_xdr_permyriad_per_icp' : IDL.Nat64,
    'name_order_cancelled_count' : IDL.Nat64,
    'name_order_placed_count' : IDL.Nat64,
    'name_order_paid_count' : IDL.Nat64,
    'user_name_order_count_by_status' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
    'last_timestamp_seconds_xdr_permyriad_per_icp' : IDL.Nat64,
    'payment_version' : IDL.Nat64,
    'user_quota_order_count' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
    'last_ledger_sync_timestamp_nanos' : IDL.Nat64,
    'registration_count' : IDL.Nat64,
  });
  const Result_8 = IDL.Variant({ 'Ok' : Stats, 'Err' : ErrorInfo });
  const SubmitOrderRequest = IDL.Record({
    'name' : IDL.Text,
    'years' : IDL.Nat32,
  });
  const SubmitOrderResponse = IDL.Record({ 'order' : GetNameOrderResponse });
  const Result_9 = IDL.Variant({
    'Ok' : SubmitOrderResponse,
    'Err' : ErrorInfo,
  });
  return IDL.Service({
    'add_quota' : IDL.Func([IDL.Principal, QuotaType, IDL.Nat32], [Result], []),
    'available' : IDL.Func([IDL.Text], [Result], ['query']),
    'cancel_order' : IDL.Func([], [Result], []),
    'get_all_details' : IDL.Func([GetPageInput], [Result_1], ['query']),
    'get_details' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'get_name_expires' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'get_names' : IDL.Func(
        [IDL.Principal, GetPageInput],
        [Result_4],
        ['query'],
      ),
    'get_owner' : IDL.Func([IDL.Text], [Result_5], ['query']),
    'get_pending_order' : IDL.Func([], [Result_6], ['query']),
    'get_quota' : IDL.Func([IDL.Principal, QuotaType], [Result_7], ['query']),
    'get_stats' : IDL.Func([], [Result_8], ['query']),
    'refund_order' : IDL.Func([], [Result], []),
    'register_for' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Nat64],
        [Result],
        [],
      ),
    'register_with_quota' : IDL.Func([IDL.Text, QuotaType], [Result], []),
    'sub_quota' : IDL.Func([IDL.Principal, QuotaType, IDL.Nat32], [Result], []),
    'submit_order' : IDL.Func([SubmitOrderRequest], [Result_9], []),
  });
};
export const init = ({ IDL }) => { return []; };
