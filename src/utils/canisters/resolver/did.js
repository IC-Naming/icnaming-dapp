export const idlFactory = ({ IDL }) => {
  const ErrorInfo = IDL.Record({ 'code' : IDL.Nat32, 'message' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : ErrorInfo });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'Err' : ErrorInfo,
  });
  return IDL.Service({
    'ensure_resolver_created' : IDL.Func([IDL.Text], [Result], []),
    'get_record_value' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'set_record_value' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
