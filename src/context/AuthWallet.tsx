import React, { useContext, useState, useEffect } from "react";
import { actorFactory } from 'utils/canisters/actorFactory';
import { whiteLists } from "utils/canisters/plugWhiteListConfig";
import { Toast } from "@douyinfe/semi-ui";
import { WalletConnector, WalletResponse, WalletType } from "utils/connector";
import { WalletConnectError } from "utils/exception";
import icpbox from "utils/icpbox";

export interface AuthWalletContextInterface {
	authError: { err: boolean, desc: string };
	wallet: WalletResponse | undefined,
	setAuthErr: ({ err: boolean, desc: string }) => void;
	connectWallet: (walletType: WalletType) => void;
	disconnectWallet: () => void;
}

function useProvideAuthWallet() {
	const [authErr, setAuthErr] = useState<{ err: boolean, desc: string }>({ err: false, desc: '' });
	const [wallet, setWallet] = useState<WalletResponse | undefined>(undefined)
	const whitelist = whiteLists();

	const connectWallet = async (walletType: WalletType) => {
		try {
			const res = await WalletConnector.connect(walletType, whitelist);
			if (res?.principalId) {
				sessionStorage.setItem('connectStatus', 'connected');
				setWallet(res)
				await actorFactory.authenticate(res!);
				return true
			} else {
				return false
			}
		}
		catch (err) {
			if (err instanceof WalletConnectError) {
				Toast.error(`connect error${err}`)
				console.error(`connect error${err}`);
			}
			else {
				Toast.error(`connect error${err}`)
				console.error(`connect error${err}`);
			}
		}
	}

	const disconnectWallet = () => {
		setWallet(undefined)
		if (wallet) WalletConnector.disconnect(wallet?.type);
	}

	useEffect(() => {
		if (icpbox.check()) {
			connectWallet(3)
			return;
		}
		(async () => {
			if (sessionStorage.getItem('connectStatus') === 'connected') {
				let walletTypeStorage = sessionStorage.getItem('walletType')
				if (walletTypeStorage) {
					switch (walletTypeStorage) {
						case "Nns":
							connectWallet(0)
							break;
						case "Plug":
							connectWallet(1)
							break;
						case "Stoic":
							connectWallet(2)
							break;
					}
				}
			}
		})();
	}, [])// eslint-disable-line react-hooks/exhaustive-deps

	return {
		wallet: wallet,
		authError: authErr,
		setAuthErr,
		connectWallet,
		disconnectWallet
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