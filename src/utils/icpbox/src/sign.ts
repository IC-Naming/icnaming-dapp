import { IDL, JsonValue } from "@dfinity/candid";
import { Buffer } from "buffer/";
import { recursiveParseBigint } from "./bigint";
import proxy from "./proxy";

export interface SignInfo {
  methodName?: string;
  requestType?: string;
  canisterId?: string;
  sender?: string;
  arguments?: Buffer;
  decodedArguments?: JsonValue;
  manual: boolean;
}

export interface AssuredSignInfo {
  methodName: string;
  requestType: string;
  canisterId: string;
  sender: string;
  arguments: Buffer;
  decodedArguments?: JsonValue;
  manual: boolean;
  preApprove: boolean;
}

type Metadata = {
  name: string;
  host: string;
};

export type ArgsTypesOfCanister = { [key: string]: { [key: string]: any } };

export const canDecodeArgs = (
  signInfo: SignInfo | undefined,
  argsTypes: ArgsTypesOfCanister
): boolean => {
  return !!(
    signInfo?.canisterId &&
    signInfo?.methodName &&
    signInfo?.arguments &&
    argsTypes[signInfo.canisterId]?.[signInfo.methodName]
  );
};

const decodeArgs = (signInfo: SignInfo, argsTypes: ArgsTypesOfCanister) => {
  if (canDecodeArgs(signInfo, argsTypes)) {
    const assuredSignInfo = signInfo as AssuredSignInfo;
    const funArgumentsTypes =
      argsTypes[assuredSignInfo.canisterId][assuredSignInfo.methodName];
    return IDL.decode(funArgumentsTypes, assuredSignInfo.arguments);
  }
};

export const signFactory =
  (
    argsTypes: ArgsTypesOfCanister,
    metadata: Metadata,
    preApprove: boolean = false
  ) =>
  async (payload: ArrayBuffer, signInfo?: SignInfo): Promise<ArrayBuffer> => {
    const payloadArr = new Uint8Array(payload);
    if (signInfo)
      signInfo.decodedArguments = signInfo.arguments
        ? recursiveParseBigint(decodeArgs(signInfo, argsTypes))
        : [];

    const res: {
      result: { data: any };
      status: string;
    } = await proxy("requestSign", [
      payloadArr,
      metadata,
      {
        ...signInfo,
        arguments: signInfo?.arguments,
        preApprove,
      },
    ] as any);

    return res.result.data;
  };

export const getArgTypes = (interfaceFactory: IDL.InterfaceFactory) => {
  const service = interfaceFactory({ IDL });
  const methodArgType = {};
  service._fields.forEach(
    ([methodName, fun]) => (methodArgType[methodName] = fun.argTypes)
  );
  return methodArgType;
};
