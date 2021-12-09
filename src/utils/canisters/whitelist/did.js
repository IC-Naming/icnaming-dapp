export const idlFactory = ({ IDL }) => {
  const Error = IDL.Record({ 'code' : IDL.Int32, 'message' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : Error });
  const WhiteListInfo = IDL.Record({
    'ens_white_list_end_date' : IDL.Nat64,
    'ens_white_list_count' : IDL.Nat64,
    'nns_staking_list_count' : IDL.Nat64,
    'nns_staking_list_end_date' : IDL.Nat64,
    'icnaming_canister_id' : IDL.Principal,
  });
  const RefStatus = IDL.Record({
    'ref_count' : IDL.Nat64,
    'credit' : IDL.Nat64,
  });
  const Result_1 = IDL.Variant({ 'Ok' : RefStatus, 'Err' : Error });
  return IDL.Service({
    'addToENSWhiteList' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'addToNNSWhiteList' : IDL.Func([IDL.Principal], [Result], []),
    'getWhiteListInfo' : IDL.Func([], [WhiteListInfo], ['query']),
    'icnaming' : IDL.Func([], [IDL.Principal], ['query']),
    'isInWhiteList' : IDL.Func([IDL.Text, IDL.Text], [Result], ['query']),
    'owner' : IDL.Func([], [IDL.Principal], ['query']),
    'refStatus' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'regName' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'setICNaming' : IDL.Func([IDL.Principal], [Result], []),
    'setOwner' : IDL.Func([IDL.Principal], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
