export const idlFactory = ({ IDL }) => {
  const ErrorInfo = IDL.Record({ 'code' : IDL.Nat32, 'message' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : ErrorInfo });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Vec(IDL.Text), 'Err' : ErrorInfo });
  return IDL.Service({
    'add_favorite' : IDL.Func([IDL.Text], [Result], []),
    'get_favorites' : IDL.Func([], [Result_1], ['query']),
    'remove_favorite' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
