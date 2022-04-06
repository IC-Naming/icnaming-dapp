import {
  SignIdentity,
  PublicKey,
  ReadRequest,
  CallRequest,
} from "@dfinity/agent";
import { JsonValue } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { Buffer } from "buffer/";
import { BinaryBlob } from "./types";
export interface SignInfo {
  methodName?: string;
  requestType?: string;
  canisterId?: string;
  sender?: string;
  arguments?: Buffer;
  decodedArguments?: JsonValue;
  manual: boolean;
}

type SignCb = (
  payload: ArrayBuffer,
  signInfo?: SignInfo
) => Promise<ArrayBuffer>;

type RequestType = ReadRequest | CallRequest;

export class WalletIdentity extends SignIdentity {
  private publicKey: PublicKey;
  private whitelist: string[];

  constructor(
    publicKey: PublicKey,
    private signCb: SignCb,
    whitelist: string[]
  ) {
    super();
    this.publicKey = publicKey;
    this.signCb = signCb;
    this.whitelist = whitelist || [];
  }

  getPublicKey(): PublicKey {
    return this.publicKey;
  }

  async sign(blob: BinaryBlob, signInfo?: RequestType): Promise<BinaryBlob> {
    const res = await this.signCb(blob, {
      sender: signInfo?.sender && Principal.from(signInfo.sender).toString(),
      methodName: signInfo?.method_name,
      requestType: signInfo?.request_type,
      canisterId: signInfo?.canister_id && Principal.from(signInfo.canister_id).toString(),
      arguments: signInfo?.arg,
      manual: false,
    });
    return res as BinaryBlob;
  }
}
