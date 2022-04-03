import { HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { StoicIdentity } from "utils/ic-stoic-identity";
import { IC_HOST } from "../config";
import { WalletConnectError, WalletConnectErrorCode } from "../exception";
import { principalToAccountID } from "../helper";
declare const window: any;
export enum WalletType {
  II,
  Plug,
  StoicWallet,
  AstroX,
}

export interface WalletResponse {
  type: WalletType;
  principalId: Principal;
  accountId: string;
  identity?: Identity;
  agent?: HttpAgent;
}
export class WalletConnector {
  public static connect = (
    walletType: WalletType,
    whitelist: Array<string>
  ) => {
    switch (walletType) {
      case WalletType.II:
        return connectII();
      case WalletType.Plug:
        return connectPlugWallet(whitelist);
      case WalletType.StoicWallet:
        return connectStoicWallet();
      case WalletType.AstroX:
        throw new WalletConnectError(
          WalletConnectErrorCode.AstorXConnectFailed,
          `Not support wallet type: ${walletType}`
        );
      default:
        throw new WalletConnectError(
          WalletConnectErrorCode.Unknown,
          `Unknown wallet type: ${walletType}`
        );
    }
  };
  public static disconnect = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.II:
        return disconnectII();
      case WalletType.Plug:
        return disconnectPlugWallet();
      case WalletType.StoicWallet:
        return disconnectStoicWallet();
      case WalletType.AstroX:
        throw new WalletConnectError(
          WalletConnectErrorCode.AstorXConnectFailed,
          `Not support wallet type: ${walletType}`
        );
      default:
        throw new WalletConnectError(
          WalletConnectErrorCode.Unknown,
          `Unknown wallet type: ${walletType}`
        );
    }
  }
}

const connectPlugWallet = async (
  whitelist: Array<string>
): Promise<WalletResponse | undefined> => {
  if (typeof (window as any).ic === "undefined") {
    window.open("https://plugwallet.ooo/");
    throw new WalletConnectError(
      WalletConnectErrorCode.PlugNotInstall,
      "Plug not install"
    );
  } else {
    try {
      const connected = await window.ic?.plug?.requestConnect({
        whitelist,
        host: IC_HOST,
      });
      if (!connected) {
        throw new WalletConnectError(
          WalletConnectErrorCode.PlugConnectFailed,
          `Plug connect failed`
        );
      }
      const principalId = await window.ic?.plug?.agent.getPrincipal();
      const agent = await window.ic?.plug?.agent;
      const accountId = principalToAccountID(principalId);
      return {
        type: WalletType.Plug,
        principalId,
        accountId,
        agent: agent,
      };
    } catch (error) {
      throw error;
    }
  }
};

const connectStoicWallet = async (): Promise<WalletResponse | undefined> => {
  const stoicConn = await StoicIdentity.load();
  try {
    if (stoicConn !== false) {
      throw new WalletConnectError(
        WalletConnectErrorCode.StoicConnectFailed,
        `Stoic connect failed`
      );
    }
    //No existing connection, lets make one!
    const identity = await StoicIdentity.connect();
    const principalId = identity?.getPrincipal();
    const accountId = principalToAccountID(principalId);
    return {
      type: WalletType.StoicWallet,
      principalId,
      accountId,
      identity,
    };
  } catch (error) {
    throw error;
  }
};

const connectII = async (): Promise<WalletResponse | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        const identity = await authClient.getIdentity();
        const accountId = principalToAccountID(identity.getPrincipal());
        resolve({
          type: WalletType.II,
          principalId: identity.getPrincipal(),
          accountId,
          identity,
        });
      } else {
        await authClient.login({
          onSuccess: async () => {
            const identity = await authClient.getIdentity();
            const accountId = principalToAccountID(identity.getPrincipal());
            resolve({
              type: WalletType.II,
              principalId: identity.getPrincipal(),
              accountId,
              identity,
            });
          },
          onError: async () => {
            reject(
              new WalletConnectError(
                WalletConnectErrorCode.IIConnectFailed,
                `Stoic connect failed`
              )
            );
          },
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
function disconnectII() {
  throw new Error("Function not implemented.");
}

function disconnectPlugWallet() {
  throw new Error("Function not implemented.");
}

function disconnectStoicWallet() {
  throw new Error("Function not implemented.");
}

