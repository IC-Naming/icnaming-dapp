export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const ICPTs = IDL.Record({ 'e8s' : IDL.Nat64 });
  const AccountBalanceArgs = IDL.Record({ 'account' : AccountIdentifier });
  const CanisterId = IDL.Principal;
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const BlockHeight = IDL.Nat64;
  const NotifyCanisterArgs = IDL.Record({
    'to_subaccount' : IDL.Opt(SubAccount),
    'from_subaccount' : IDL.Opt(SubAccount),
    'to_canister' : IDL.Principal,
    'max_fee' : ICPTs,
    'block_height' : BlockHeight,
  });
  const Memo = IDL.Nat64;
  const TimeStamp = IDL.Record({ 'timestamp_nanos' : IDL.Nat64 });
  const SendArgs = IDL.Record({
    'to' : AccountIdentifier,
    'fee' : ICPTs,
    'memo' : Memo,
    'from_subaccount' : IDL.Opt(SubAccount),
    'created_at_time' : IDL.Opt(TimeStamp),
    'amount' : ICPTs,
  });
  return IDL.Service({
    'account_balance_dfx' : IDL.Func([AccountBalanceArgs], [ICPTs], ['query']),
    'get_nodes' : IDL.Func([], [IDL.Vec(CanisterId)], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'notify_dfx' : IDL.Func([NotifyCanisterArgs], [], []),
    'send_dfx' : IDL.Func([SendArgs], [BlockHeight], []),
  });
};