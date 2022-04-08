interface ErrorInfo {
  code: number;
  message: string;
}
// CanisterErrorCode
export enum CanisterErrorCode {
  DFTError = 3,
}

export class CanisterError extends Error {
  readonly code: number;
  readonly message: string;
  constructor(err: ErrorInfo) {
    super(err.message);
    this.code = err.code;
    this.message = err.message;
    this.name = "CanisterError";
  }
}

export enum WalletConnectErrorCode {
  PlugNotInstall = 1,
  PlugConnectFailed = 2,
  StoicConnectFailed = 3,
  AstorXConnectFailed = 4,
  IIConnectFailed = 5,
  Unknown = 10000,
}

export class WalletConnectError extends Error {
  readonly code: number;
  readonly message: string;
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
    this.name = "WalletConnectError";
  }
}
