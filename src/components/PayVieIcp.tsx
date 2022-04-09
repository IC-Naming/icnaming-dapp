import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { Modal, Timeline, Spin } from "@douyinfe/semi-ui";
import { useHistory } from "react-router-dom";
import styles from '../assets/styles/Name.module.scss'
import payStyles from '../assets/styles/Pay.module.scss'
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from "utils/ServiceApi";
import { deleteCache } from "../utils/localCache";
import { CancelOrderIcp } from "components/CancelOrderIcp";
import BigNumber from "bignumber.js";
import { useMyInfo } from "context/MyInfo";
import toast from "@douyinfe/semi-ui/lib/es/toast";
import icpbox from "@icpbox/js-sdk";
declare var window: any;
interface IcpPayProps {
	orderInfo: {
		name: string,
		nameLen: number,
		payStatus: object,
		payYears: number,
	};
	checkRefund: () => void;
}

const toICPe8s = (source: string): bigint => {
	if (!source) {
		return BigInt(0);
	}
	// replace all _  to empty string
	const str = source.replace(/_/g, "").toLowerCase();
	// treat as icp if icp in string
	if (str.includes("icp")) {
		// remove icp and convert to bigint
		return BigInt(parseFloat(str.replace("icp", "")) * 100_000_000);
	} else {
		// convert to bigint
		return BigInt(str);
	}
}

export const PayVieIcp: React.FC<IcpPayProps> = ({ orderInfo, checkRefund }) => {
	const history = useHistory();
	const { ...authWallet } = useAuthWallet();
	const { ...myInfo } = useMyInfo();
	const [modalVisible, setModalVisible] = useState<boolean>(false)
	const [stoicVisible, setStoicVisible] = useState<boolean>(false)
	const [checkOrderIng, setCheckOrderIng] = useState<boolean>(false)
	const [nameAvailable, setNameAvailable] = useState<boolean>(false)
	const [paymentInfo, setPaymentInfo] = useState<any>({ paymentAccountId: 0, paymentMemo: 0, years: 1, priceIcp: 0, cycles: 2 })
	const [order, setOrder] = useState<any>([])
	const [payIng, setPayIng] = useState<boolean>(false)
	const [stoicPayIng, setStoicPayIng] = useState<boolean>(false)
	const [paymentResult, setPaymentResult] = useState<boolean>(false)
	const [blockHeight, setBlockHeight] = useState<number>(0)
	const [confirmIng, setConfirmIng] = useState<boolean>(true)
	const [confirmAgain, setConfirmAgain] = useState<boolean>(false)
	const [confirmStatus, setConfirmStatus] = useState<'success' | 'fail' | 'exception'>('success')
	/**
	 * try to confirm order payment for several times
	 * go to my account when it confirms success
	 * reload current order if it fails
	 */
	const confirmOrderFunction = async () => {
		enum ConfirmStatus {
			Success,
			Fail,
			Exception
		}
		console.log('block_height-----------', blockHeight);
		console.assert(blockHeight > 0, 'blockHeight must be greater than 0');
		// get confirm status
		let confirmStatus = await (async () => {
			let result_status = ConfirmStatus.Success;
			/* const max_retry = 2;for (let i = 0; i < max_retry; i++) {} */
			try {
				let result = await (await ServiceApi.getInstance()).confirmOrder(BigInt(blockHeight));
				console.log('confirmOrder result', result)
				if (result) {
					result_status = ConfirmStatus.Success;
				} else {
					result_status = ConfirmStatus.Fail;
				}
			} catch (error) {
				console.error(`exception when confirm order: ${error}`);
				result_status = ConfirmStatus.Exception;
			}
			return result_status;
		})();
		console.log(`confirm status: ${confirmStatus}`);
		setConfirmIng(false)
		setConfirmAgain(false)
		switch (confirmStatus) {
			case ConfirmStatus.Success:
				console.log('You got the name! please check it out from MyAccount');
				myInfo.cleanPendingOrder()
				setConfirmStatus('success');
				deleteCache('getNamesOfRegistrant' + authWallet.wallet);
				deleteCache('namesOfController' + authWallet.wallet)
				break;
			case ConfirmStatus.Exception:
				setConfirmStatus('exception');
				break;
			case ConfirmStatus.Fail:
				// name is not available or invalid request from client
				setConfirmStatus('fail');
				console.log('fail confirm order, but payment success');
				break;
		}
	}

	useEffect(() => {
		if (blockHeight !== undefined && blockHeight > 0) { confirmOrderFunction() };
		// return () => { setBlockHeight(0) };
	}, [blockHeight])// eslint-disable-line react-hooks/exhaustive-deps

	const arrayToHex = (arr: Array<number>) => {
		return arr.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
	}

	const payment = async () => {
		if (payIng) return;
		switch (sessionStorage.getItem('walletType')) {
			case 'Icpbox':
				payIcpbox();
				break;
			case 'Stoic':
				setStoicVisible(true)
				break;
			case 'Plug':
				payPlug();
				break;
		}
	}

	const payIcpbox = async () => {
		const icpboxConnected: any = await icpbox.isConnected();
		if (icpboxConnected.result !== true) {
			alert('no auth')
		} else {
			setPayIng(true);
			setModalVisible(true)
			console.log('pay Icpbox ==============')
			icpbox.pay({
				amount: new BigNumber(order[0].price_icp_in_e8s.toString()).div(100000000).toString(),
				to: arrayToHex(order[0].payment_account_id),
				memo: order[0].payment_memo.ICP.toString(),
				fee: '10000'
			}).then(payResult => {
				console.log('paydata', payResult)
				setBlockHeight(Number(payResult.status))
				setPayIng(false);
				setPaymentResult(true);
			}).catch(error => {
				console.log(`Icpbox Payment failed: ${JSON.stringify(error)}`);
				setPayIng(false)
				setPaymentResult(false)
				return
			});

		}
	}

	const payPlug = async () => {
		setPayIng(true);
		setModalVisible(true)
		try {
			if (blockHeight === 0) {
				const payResult = await window.ic.plug.requestTransfer({
					to: arrayToHex(order[0].payment_account_id),
					amount: Number(order[0].price_icp_in_e8s),
					opts: {
						fee: 10000,
						memo: order[0].payment_memo.ICP.toString(),
					},
				});
				console.log(`Pay success: ${JSON.stringify(payResult)}`);
				setBlockHeight(payResult.height)
				setPayIng(false);
				setPaymentResult(true);
			}
		} catch (err) {
			setPayIng(false)
			setPaymentResult(false)
			console.log(`Payment failed: ${JSON.stringify(err)}`);
			return
		}
	}

	const payStoic = async () => {
		if (stoicPayIng) return;
		setStoicPayIng(true);
		setStoicVisible(false)
		setPayIng(true);
		setModalVisible(true)
		try {
			if (blockHeight === 0) {
				const transfer_result: any = (await ServiceApi.getInstance()).payledger(
					order[0].payment_account_id,
					order[0].price_icp_in_e8s,
					toICPe8s(order[0].payment_memo.ICP.toString())
				)
				console.log('Stoic transfer_result', transfer_result);
				if (transfer_result.Ok !== undefined) {
					console.log(`StoicPay success: ${transfer_result.Ok}`);
					setBlockHeight(transfer_result.Ok)
					setPaymentResult(true);
				} else {
					setPaymentResult(false)
				}
				setStoicPayIng(false);
				setPayIng(false);
			}
		} catch (error) {
			setStoicPayIng(false)
			setPayIng(false)
			setPaymentResult(false)
			console.log(`Payment failed: ${JSON.stringify(error)}`);
			return
		}
	}

	const checkOrder = async (name) => {
		console.log('checkOrder start', name)
		setCheckOrderIng(true)
		enum OrderStatus {
			Available,
			Disabled,
			NotOrder,
			Refund,
		}
		if (authWallet.wallet?.principalId) {
			const serviecOrderInfo: any = [];
			let orderStatus = await (async () => {
				let result_Status = OrderStatus.Available;
				const [availableResult, orderResult] = await Promise.all([(await ServiceApi.getInstance()).available(name).catch(err => {
					console.log(err)
				}), (await ServiceApi.getInstance()).getPendingOrder()]);

				if (orderResult.length !== 0) {
					serviecOrderInfo.push(orderResult[0])
					setOrder(serviecOrderInfo)
					let nameLen = orderResult[0].name.replace('.icp', "").length
					nameLen = nameLen >= 7 ? 7 : nameLen;
					let cycles = 0;
					const icpToCycles = localStorage.getItem('icpToCycles')
					if (icpToCycles) {
						const icpToCyclesObj = JSON.parse(icpToCycles)
						cycles = icpToCyclesObj[nameLen - 1].cycles
					}
					setPaymentInfo({
						priceIcp: new BigNumber(orderResult[0].price_icp_in_e8s.toString()).div(100000000).toString(),
						cycles: cycles,
						years: orderResult[0].years
					})
					if ("WaitingToRefund" in orderResult[0].status) {
						result_Status = OrderStatus.Refund;
					} else {
						result_Status = availableResult === true ? OrderStatus.Available : OrderStatus.Disabled;
					}
				} else {
					result_Status = OrderStatus.NotOrder;
				}
				return result_Status;
			})();
			setCheckOrderIng(false)
			console.log('OrderStatus', orderStatus)
			switch (orderStatus) {
				case OrderStatus.Available:
					setNameAvailable(true)
					break;
				case OrderStatus.Disabled:
					setNameAvailable(false)
					break;
				case OrderStatus.NotOrder:
					history.push('/myaccount');
					toast.error('no pending order')
					break;
				case OrderStatus.Refund:
					checkRefund();
					break;
			}
		}
	}

	useEffect(() => {
		const orderInfo = localStorage.getItem('orderInfo');
		if (orderInfo) {
			const orderInfoObj = JSON.parse(orderInfo)
			checkOrder(orderInfoObj.name)
		}
	}, [authWallet.wallet])// eslint-disable-line react-hooks/exhaustive-deps

	const retryToConfirm = () => {
		if (confirmAgain) return
		setConfirmAgain(true)
		checkOrder(myInfo.orderInfo.name)
	}
	return (
		<React.Fragment>
			{
				checkOrderIng ?
					<div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>
					:
					<React.Fragment>
						{
							nameAvailable ?
								<>
									<Row>
										<Col md={4} sm={12}>Registration Period </Col>
										<Col md={4} sm={12}> {paymentInfo.years} Years</Col>
										<Col md={4} sm={12}></Col>
									</Row>
									<Row className="mb-5">
										<Col md={4} sm={12}>Registration to Price</Col>
										<Col md={4} sm={12}>{paymentInfo.priceIcp} ICP ≈ {paymentInfo.cycles} T Cycles</Col>
										<Col md={4} sm={12}></Col>
									</Row>
								</> :
								<div className={payStyles['order-info-msg']}>
									The domain name is not available
								</div>
						}
						<div className={payStyles['btn-pay-wrap']}>
							<CancelOrderIcp name={orderInfo.name} />
							{nameAvailable &&
								blockHeight === 0 &&
								<button className={`${styles.btn} ${payStyles['btn-pay-icp']}`} onClick={payment}>
									{modalVisible && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}Pay
								</button>
							}
						</div>
					</React.Fragment>
			}
			<Modal
				header={null}
				footer={null}
				visible={modalVisible}
				maskClosable={false}
				className={payStyles['modal-wrap-icpPay']}
			>
				{
					confirmIng ?
						<React.Fragment>
							<Timeline className={payStyles['paymentIcpTimeline']}>
								<Timeline.Item type="ongoing">{payIng && <Spin size="small" />}Payment in progress</Timeline.Item>
								{
									payIng ? null :
										paymentResult ?
											<React.Fragment >
												<Timeline.Item type="success">Payment success</Timeline.Item>
												<Timeline.Item color="pink"><Spin size="small" />It's almost done, ICNaming is doing the final confirmation.</Timeline.Item>
											</React.Fragment>
											:
											<Timeline.Item type="error">
												Failed to transfer, please DO NOT retry to pay before checking your balance. If you find out your balance is taken, please wait and check in "My Account" page by refreshing, your order will be confirmed automatically by system within 5 minutes.
											</Timeline.Item>
								}
							</Timeline>
							{
								payIng ? null :
									!paymentResult &&
									<div className={payStyles['btn-wrap']}>
										<button className={payStyles['btn']} onClick={() => {
											setModalVisible(false)
											setCheckOrderIng(false)
											setPayIng(false)
											setPaymentResult(false)
											setConfirmIng(true)
										}}>Cancel</button>
									</div>
							}
						</React.Fragment> :
						<React.Fragment>
							{
								confirmStatus === 'success' &&
								<React.Fragment>
									<div className={payStyles['confirm-msg']}>
										Congratulations! <br />Now you are the owner of <br />[ {orderInfo.name} ]
									</div>
									<div className="d-grid gap-2">
										<button className={`${payStyles['btn']}`} onClick={() => { history.push('/myaccount') }}>Go to MyAccount</button>
									</div>
								</React.Fragment>
							}
							{
								confirmStatus === 'exception' &&
								<React.Fragment>
									<div className={payStyles['confirm-msg']}>
										Sorry, something error, please retry to confirm payment.
									</div>
									<div className="d-grid gap-2">
										<button
											className={`${payStyles['btn']}  ${payStyles['btn-order']}`}
											disabled={confirmAgain}
											onClick={retryToConfirm}>
											{confirmAgain && <Spin size="middle" />}Retry to confirm
										</button>
									</div>
								</React.Fragment>
							}
							{
								confirmStatus === 'fail' &&
								<React.Fragment>
									<div className={payStyles['confirm-msg']}>
										Sorry, order status has been changed, please refresh current page.
									</div>
									<div className="d-grid gap-2">
										<button className={payStyles['btn']} onClick={() => { window.location.reload() }}>Refresh</button>
									</div>
								</React.Fragment>
							}
						</React.Fragment>
				}
			</Modal>
			<Modal
				header={null}
				footer={null}
				visible={stoicVisible}
				maskClosable={false}
				className={payStyles['modal-wrap-stoicpay']}
			>
				<div className={payStyles['modal-wrap-stoicpay-conent']}>
					<h2>Please confirm that you are about to send</h2>
					<h3>Amount: {paymentInfo.priceIcp} ICP</h3>
					<div className={payStyles['modal-stoic-btn-wrap']}>
						<button className={payStyles['btn']} onClick={() => { setStoicVisible(false) }}>Decline</button>
						<button className={payStyles['btn']} onClick={payStoic}>
							Confirm
						</button>
					</div>
				</div>
			</Modal>
		</React.Fragment >
	)
}