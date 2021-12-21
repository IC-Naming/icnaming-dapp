export const idlFactory = ({ IDL }) => {
  const Error = IDL.Record({ 'code' : IDL.Nat32, 'message' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : Error });
  const WhiteListInfo = IDL.Record({
    'credit_remain' : IDL.Nat64,
    'ens_white_list_end_date' : IDL.Nat64,
    'ens_white_list_count' : IDL.Nat64,
    'nns_staking_list_count' : IDL.Nat64,
    'nns_staking_list_end_date' : IDL.Nat64,
    'ic_test_end_date' : IDL.Nat64,
    'icnaming_canister_id' : IDL.Principal,
    'ic_test_list_count' : IDL.Nat64,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : Error });
  const RefStatus = IDL.Record({
    'ref_count' : IDL.Nat64,
    'credit' : IDL.Nat64,
  });
  const Result_2 = IDL.Variant({ 'Ok' : RefStatus, 'Err' : Error });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Nat32, 'Err' : Error });
  return IDL.Service({
    'addToENSWhiteList' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'addToNNSWhiteList' : IDL.Func([IDL.Principal], [Result], []),
    'getWhiteListInfo' : IDL.Func([], [WhiteListInfo], ['query']),
    'icnaming' : IDL.Func([], [Result_1], ['query']),
    'isInWhiteList' : IDL.Func([IDL.Text, IDL.Text], [Result], ['query']),
    'owner' : IDL.Func([], [IDL.Principal], ['query']),
    'refStatus' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'regName' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
    'regNameForTest' : IDL.Func([IDL.Text], [Result], []),
    'regProxy' : IDL.Func([], [IDL.Principal], ['query']),
    'setCreditLimit' : IDL.Func([IDL.Nat64], [Result], []),
    'setICNaming' : IDL.Func([IDL.Principal], [Result], []),
    'setOwner' : IDL.Func([IDL.Principal], [Result], []),
    'setRegProxy' : IDL.Func([IDL.Principal], [Result], []),
    'testCredit' : IDL.Func([], [Result_3], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
