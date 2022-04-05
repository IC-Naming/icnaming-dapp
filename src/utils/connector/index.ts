import { HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { StoicIdentity } from "utils/ic-stoic-identity";
import { IC_HOST } from "../config";
import { WalletConnectError, WalletConnectErrorCode } from "../exception";
import { principalToAccountID } from "../helper";
declare const window: any;
export enum WalletType {
  Nns,
  Plug,
  Stoic,
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
      case WalletType.Nns:
        return connectII();
      case WalletType.Plug:
        return connectPlugWallet(whitelist);
      case WalletType.Stoic:
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
    localStorage.removeItem('myFavoriteNames');
    localStorage.removeItem('myQuotas');
    sessionStorage.removeItem("connectStatus");
    sessionStorage.removeItem("walletType");
    sessionStorage.removeItem("orderInfo");
    switch (walletType) {
      case WalletType.Nns:
        return disconnectII();
      case WalletType.Plug:
        return disconnectPlugWallet();
      case WalletType.Stoic:
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
    let connected
    try {
      const isConnected = await window.ic.plug.isConnected();
      if (isConnected && !window.ic.plug.agent) {
        connected = await window.ic?.plug?.createAgent({ whitelist, host: IC_HOST });
      } else {
        connected = await window.ic?.plug?.requestConnect({ whitelist, host: IC_HOST });
      }

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
  let identity;
  const stoicConn = await StoicIdentity.load();
  try {
    if (stoicConn === false) {
      identity = await StoicIdentity.connect();
    } else {
      identity = stoicConn;
    }
    const principalId = identity?.getPrincipal();
    const accountId = principalToAccountID(principalId);
    return {
      type: WalletType.Stoic,
      principalId,
      accountId,
      identity,
    };
  } catch (error) {
    throw new WalletConnectError(
      WalletConnectErrorCode.StoicConnectFailed,
      `Stoic connect failed`
    );
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
          type: WalletType.Nns,
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
              type: WalletType.Nns,
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

const disconnectII = async () => {
  localStorage.removeItem('ic-identity');
  localStorage.removeItem('ic-delegation');
  const authClient = await AuthClient.create();
  authClient.logout()
}
const disconnectPlugWallet = async () => {
  window.ic?.plug?.disconnect();
}

const disconnectStoicWallet = async () => {
  localStorage.removeItem("_scApp");
  StoicIdentity.disconnect();
}

