import React, { useContext, useState, useEffect } from "react";
import { Principal } from "@dfinity/principal";
import ServiceApi from "../utils/ServiceApi";
import { useAuthWallet } from "./AuthWallet";
import BigNumber from "bignumber.js";
import toast from "@douyinfe/semi-ui/lib/es/toast";

export interface MyInfoContextInterface {
	orderInfo: {
		name: string,
		nameLen: number,
		payYears: number,
		payType: 'icp' | 'quota',
		payStatus: object,
		quotaType?: number,
	};
	icpToCycles: Array<{ icp: string, cycles: string }>;
	hasPendingOrder: boolean;
	quotas: Array<number>;
	createOrder: (order: { name: string, nameLen: number, payYears: number, payStatus: object, payType: 'icp' | 'quota', quotaType?: number }) => void;
	getMyQuotas: () => void;
	getIcpToCycles: () => void;
	checkPendingOrder: () => void;
	cleanPendingOrder: () => void;
}

function useProvideMyInfo() {
	const { ...authWallet } = useAuthWallet();
	const [orderInfo, setOrderInfo] = useState<{ name: string, nameLen: number, payStatus: object, payYears: number, payType: 'icp' | 'quota', quotaType?: number }>({
		name: '',
		nameLen: 0,
		payStatus: {},
		payYears: 1,
		payType: 'icp',
		quotaType: 7
	})
	const [icpToCycles, setIcpToCycles] = useState<Array<{ icp: string, cycles: string }>>([])
	const [pendingOrder, setPendingOrder] = useState<boolean>(false)

	const [quotas, setQuotas] = useState<Array<number>>([])
	const [innerTimerTick, setInnerTimerTick] = useState(0);

	const createOrder = (order: { name: string; nameLen: number; payStatus: object, payYears: number; payType: 'icp' | 'quota'; quotaType?: number; }) => {
		setOrderInfo({
			name: order.name,
			nameLen: order.nameLen,
			payStatus: order.payStatus,
			payYears: order.payYears,
			payType: order.payType,
			quotaType: order.quotaType,
		})
		localStorage.setItem('orderInfo', JSON.stringify(order))
	}

	const getMyQuotas = async () => {
		const get_MyQuotas = async (user: Principal) => {
			const [quota4, quota5, quota6, quota7] = await Promise.all([
				(await ServiceApi.getInstance()).getQuota(user, 4),
				(await ServiceApi.getInstance()).getQuota(user, 5),
				(await ServiceApi.getInstance()).getQuota(user, 6),
				(await ServiceApi.getInstance()).getQuota(user, 7),
			]);
			return [quota4, quota5, quota6, quota7];
		}
		if (authWallet.wallet?.principalId) {
			try {
				const res = await get_MyQuotas(authWallet.wallet?.principalId);
				localStorage.setItem('myQuotas', JSON.stringify(res))
				setQuotas(res)
			} catch (error) {
				console.log('myInfo get_MyQuotas', error)
				/* authWallet.disconnectWallet()
				authWallet.setAuthErr({ err: true, desc: 'There was an error - please ensure you have Cookies Enabled' }) */
			}
		}
	}

	const checkPendingOrder = async () => {
	
		(await ServiceApi.getInstance()).getPendingOrder().then(res => {
			console.log(res)
			if (res.length !== 0) {
				setPendingOrder(true)
				createOrder({
					name: res[0].name,
					nameLen: res[0].name.split('.').length,
					payStatus: res[0].status,
					payYears: res[0].years,
					payType: 'icp',
				})
			} else {
				setPendingOrder(false)
			}
		}).catch(error => {
			console.log('getPendingOrder', error)
			/* authWallet.disconnectWallet()
			authWallet.setAuthErr({err:true,desc:'There was an error - please ensure you have Cookies Enabled'}) */
		})
	}

	useEffect(() => {
		if (authWallet.wallet?.principalId) {
			checkPendingOrder();
			getMyQuotas();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authWallet.wallet])

	const getIcpToCycles = async () => {
		(await ServiceApi.getInstance()).getIcpToCycles().then(res_IcpToCycles => {
			const res_IcpToCycles_map = res_IcpToCycles.map((item, index) => {
				return {
					icp: new BigNumber(item.price_in_icp_e8s.toString()).div(100000000).toString(),
					cycles: new BigNumber(item.price_in_xdr_permyriad.toString()).div(10000).toString()
				}
			})
			localStorage.setItem('icpToCycles', JSON.stringify(res_IcpToCycles_map))
			setIcpToCycles(res_IcpToCycles_map)
		}).catch(err => {
			toast.error(err.message)
		});
	}

	useEffect(() => {
		// console.debug('getIcpToCycles start')
		getIcpToCycles()
		return () => {
			// console.debug('getIcpToCycles end')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [innerTimerTick])

	useEffect(() => {
		setInnerTimerTick(1000);
		const loopTimer = setInterval(() => setInnerTimerTick(t => t + 1), 60 * 1000);
		// console.debug('loopTimer', loopTimer)
		return () => {
			if (loopTimer) {
				clearInterval(loopTimer);
			}
		}
	}, [])

	return {
		orderInfo: orderInfo,
		hasPendingOrder: pendingOrder,
		icpToCycles: icpToCycles,
		quotas: quotas,
		createOrder,
		getMyQuotas,
		getIcpToCycles,
		checkPendingOrder,
		cleanPendingOrder: () => { setPendingOrder(false) }
	}
}

export const MyInfoContext = React.createContext<MyInfoContextInterface>(null!);
export function ProvideMyInfoContext({ children }) {
	const myInfo = useProvideMyInfo();
	return <MyInfoContext.Provider value={myInfo}>{children}</MyInfoContext.Provider>;
}

export const useMyInfo = () => {
	return useContext(MyInfoContext);
};