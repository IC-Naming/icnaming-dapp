import React, { useContext, useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { actorFactory } from '../utils/canisters/actorFactory';
import { IC_HOST } from "../utils/config";
import { principalToAccountID } from "../utils/helper";
import { Principal } from "@dfinity/principal";
import { whietLists } from "../utils/canisters/plugWhiteListConfig";
declare const window: any;

export interface AuthWalletContextInterface {
  isAuthWalletConnected: boolean;
  walletAddress: string;
  principal?: Principal;
  accountId: string;
  walletType: string;
  connectPlugWallet();
  connectII();
  quitWallet();
  setAuthWalletConnected: (arg0: boolean) => void;
  setWalletAddress: (arg0: string) => void;
}

function useProvideAuthWallet() {
  const [isAuthWalletConnected, setAuthWalletConnected] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [walletAccountId, setWalletAccountId] = useState<string>('')
  const [walletType, setWalletType] = useState<string>('plug')
  const [principal, setPrincipal] = useState<Principal>()
  const whitelist = whietLists();

  const setauthWalletState = (accountId, principalId, connected, walletType) => {
    setWalletAccountId(accountId)
    setPrincipal(principalId)
    setAuthWalletConnected(connected)
    setWalletAddress(principalId.toText())
    setWalletType(walletType)
    sessionStorage.setItem('walletType', walletType)
  }
  const connectPlugWallet = async () => {
    return new Promise(async (resolve, reject) => {
      if (typeof (window as any).ic === 'undefined') {
        window.open('https://plugwallet.ooo/')
        return false
      } else {
        try {
          const requestConnect = await window.ic?.plug?.requestConnect({
            whitelist,
            host: IC_HOST
          });
          if (requestConnect) {
            const principalId = await window.ic?.plug?.agent.getPrincipal();
            actorFactory.authenticateWithAgent(await window.ic?.plug?.agent);
            const accountId = principalToAccountID(principalId)
            setauthWalletState(accountId, principalId, true, 'plug')
            sessionStorage.setItem("connectStatus", 'connected');
            resolve({ connected: requestConnect, account: principalId })
          } else {
            console.log('error')
            reject({ connected: requestConnect, account: "" });
          }
        } catch (error) {
          reject(error)
        }
      }
    });
  }

  useEffect(() => {
    if (sessionStorage.getItem('connectStatus') === 'connected') {
      setAuthWalletConnected(true)
    }
    const getCurrentAccountOfPlug = () => {
      return new Promise(async (resolve, reject) => {
        if (typeof (window as any).ic === 'undefined') {
          resolve({ connected: false, account: "" });
        } else {
          try {
            const connected = await window.ic.plug.isConnected();
            if (connected && !window.ic.plug.agent) {
              await window.ic?.plug?.createAgent({ whitelist, host: IC_HOST });
              const principalId = await window.ic?.plug?.agent.getPrincipal();
              actorFactory.authenticateWithAgent(await window.ic?.plug?.agent)
              const accountId = principalToAccountID(principalId)
              setauthWalletState(accountId, principalId, true, 'plug')
              resolve({ connected: true, account: principalId });
            } else {
              resolve({ connected: false, account: "" });
            }
          } catch (error) {
            reject(error)
          }
        }
      });
    }
    getCurrentAccountOfPlug()
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  /* 
   *  Connect Icp 
   */
  const connectII = async () => {
    return new Promise(async (resolve, reject) => {
      const authClient = await AuthClient.create();
      await authClient.login({
        onSuccess: async () => {
          const identity = await authClient.getIdentity();
          actorFactory.authenticateWithIdentity(identity);
          const accountId = principalToAccountID(identity.getPrincipal())
          setauthWalletState(accountId, identity.getPrincipal(), true, 'nns')
          sessionStorage.setItem("connectStatus", 'connected');
          resolve({ connected: true, account: identity.getPrincipal().toText() })
        }
      })
    });
  }

  useEffect(() => {
    if (sessionStorage.getItem('connectStatus') === 'connected') {
      setAuthWalletConnected(true)
    }
    const getCurrentAccountOfII = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        const identity = await authClient.getIdentity();
        actorFactory.authenticateWithIdentity(identity);
        const accountId = principalToAccountID(identity.getPrincipal())
        setauthWalletState(accountId, identity.getPrincipal(), true, 'nns')
      }
    }
    getCurrentAccountOfII()
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const quitWallet = async () => {
    sessionStorage.removeItem("connectStatus");
    setAuthWalletConnected(false)
    setWalletAccountId('')
    setWalletAddress('')
    setPrincipal(undefined)
    if (window.ic.plug.agent) {
      window.ic?.plug?.disconnect()
    } else {
      const authClient = await AuthClient.create();
      authClient.logout()
    }
  }

  return {
    isAuthWalletConnected: isAuthWalletConnected,
    walletAddress: walletAddress,
    principal: principal,
    accountId: walletAccountId,
    walletType: walletType,
    setAuthWalletConnected,
    setWalletAddress,
    connectPlugWallet,
    connectII,
    quitWallet,
  }
}

export const ConnectContext = React.createContext<AuthWalletContextInterface>(null!);
export function ProvideConnectContext({ children }) {
  const authWallet = useProvideAuthWallet();
  return <ConnectContext.Provider value={authWallet}>{children}</ConnectContext.Provider>;
}

export const useAuthWallet = () => {
  return useContext(ConnectContext);
};