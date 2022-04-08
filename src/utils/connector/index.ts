import { HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { StoicIdentity } from "utils/ic-stoic-identity";
import icpbox from "utils/icpbox";
import { IC_HOST } from "../config";
import { WalletConnectError, WalletConnectErrorCode } from "../exception";
import { principalToAccountID } from "../helper";
declare const window: any;
export enum WalletType {
  II,
  Plug,
  Stoic,
  Icpbox,
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
  public static connect = (walletType: WalletType, whitelist: Array<string>) => {
    switch (walletType) {
      case WalletType.II:
        return connectII();
      case WalletType.Plug:
        return connectPlugWallet(whitelist);
      case WalletType.Stoic:
        return connectStoicWallet();
      case WalletType.Icpbox:
        return connectIcpboxWallet(whitelist);
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
      case WalletType.II:
        return disconnectII();
      case WalletType.Plug:
        return disconnectPlugWallet();
      case WalletType.Stoic:
        return disconnectStoicWallet();
      case WalletType.Icpbox:
        return disconnectIcpboxWallet();
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
      sessionStorage.setItem('walletType', 'Plug');
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
    sessionStorage.setItem('walletType', 'Stoic');
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
        sessionStorage.setItem('walletType', 'II');
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
            sessionStorage.setItem('walletType', 'II');
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

const connectIcpboxWallet = async (whitelist: string[]) => {
  try {
    const icpboxConnected: any = await icpbox.isConnected();
    console.log('icpboxConnected', icpboxConnected);
    if (icpboxConnected === true && sessionStorage.getItem('connectStatus') === 'connected') {
      const localauthData: any = localStorage.getItem('icpboxAuth');
      const auth_data = JSON.parse(localauthData)
      icpbox.setPublickKey(auth_data.publicKey);
      const accountId = principalToAccountID(Principal.fromText(auth_data.principal));
      const principalId = Principal.fromText(auth_data.principal);

      console.log('local principal', Principal.fromText(auth_data.principal))
      sessionStorage.setItem('walletType', 'Icpbox');
      return {
        type: WalletType.Icpbox,
        principalId,
        accountId,
      };
    } else {
      console.log('auto authorize')
      const authData: any = await icpbox.authorize({ canisters: whitelist });
      console.log("auth ok: ", authData);
      icpbox.setPublickKey(authData.publicKey);
      const accountId = principalToAccountID(Principal.fromText(authData.principal))
      const principalId = Principal.fromText(authData.principal);
      localStorage.setItem('icpboxAuth', JSON.stringify(authData))
      sessionStorage.setItem('walletType', 'Icpbox');
      return {
        type: WalletType.Icpbox,
        principalId,
        accountId,
      };
    }
  } catch (error) {
    console.log('icpbox error', error);
  }
}

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

const disconnectIcpboxWallet = async () => {
  localStorage.removeItem("icpboxAuth");
  icpbox.disConnect();
}
