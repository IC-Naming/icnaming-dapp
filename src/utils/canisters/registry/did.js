export const idlFactory = ({ IDL }) => {
  const GetPageInput = IDL.Record({
    'offset' : IDL.Nat64,
    'limit' : IDL.Nat64,
  });
  const GetPageOutput = IDL.Record({ 'items' : IDL.Vec(IDL.Text) });
  const ErrorInfo = IDL.Record({ 'code' : IDL.Nat32, 'message' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : GetPageOutput, 'Err' : ErrorInfo });
  const RegistryDto = IDL.Record({
    'ttl' : IDL.Nat64,
    'resolver' : IDL.Principal,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'Ok' : RegistryDto, 'Err' : ErrorInfo });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : ErrorInfo });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : ErrorInfo });
  const RegistryUsers = IDL.Record({
    'owner' : IDL.Principal,
    'operators' : IDL.Vec(IDL.Principal),
  });
  const Result_4 = IDL.Variant({ 'Ok' : RegistryUsers, 'Err' : ErrorInfo });
  const Result_5 = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : ErrorInfo });
  return IDL.Service({
    'get_controlled_names' : IDL.Func(
        [IDL.Principal, GetPageInput],
        [Result],
        ['query'],
      ),
    'get_details' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'get_owner' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'get_resolver' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'get_ttl' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'get_users' : IDL.Func([IDL.Text], [Result_4], ['query']),
    'set_approval' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Bool],
        [Result_5],
        [],
      ),
    'set_record' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Principal],
        [Result_5],
        [],
      ),
    'set_subdomain_owner' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Principal, IDL.Nat64, IDL.Principal],
        [Result_1],
        [],
      ),
    'set_top_name' : IDL.Func([], [Result_5], []),
  });
};
export const init = ({ IDL }) => { return []; };
