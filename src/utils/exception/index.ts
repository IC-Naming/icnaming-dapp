interface ErrorInfo {
  code: number;
  message: string;
}
// CanisterErrorCode
export enum CanisterErrorCode {
  DFTError = 3,
}

class CanisterError extends Error {
  readonly code: number;
  readonly message: string;
  constructor(err: ErrorInfo) {
    super(err.message);
    this.code = err.code;
    this.message = err.message;
    this.name = "CanisterError";
  }
}

export { CanisterError };
