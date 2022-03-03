import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { Modal, Timeline, Spin } from "@douyinfe/semi-ui";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styles from '../assets/styles/Name.module.scss'
import payStyles from '../assets/styles/Pay.module.scss'
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from "../utils/ServiceApi";
import { deleteCache } from "../utils/localCache";
import { CancelOrderIcp } from "components/CancelOrderIcp";
declare var window: any;
interface IcpPayProps {
	icpPayAmountDesc: string;
	orderInfo: {
		name: string,
		nameLen: number,
		payStatus: object,
		payYears: number,
	};
	checkRefund: () => void;
}

export const PayVieIcp: React.FC<IcpPayProps> = ({ icpPayAmountDesc, orderInfo, checkRefund }) => {
	const history = useHistory();
	const serviceApi = new ServiceApi();
	const { ...authWallet } = useAuthWallet();
	const [modalVisible, setModalVisible] = useState<boolean>(false)
	const [checkOrderIng, setCheckOrderIng] = useState<boolean>(false)

	const [payIng, setPayIng] = useState<boolean>(false)
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
			const max_retry = 3;
			let result_status = ConfirmStatus.Success;
			for (let i = 0; i < max_retry; i++) {
				try {
					let result = await serviceApi.confirmOrder(BigInt(blockHeight));
					console.log(result)
					if (result) {
						result_status = ConfirmStatus.Success;
						break;
					} else {
						result_status = ConfirmStatus.Fail;
					}
				} catch (error) {
					console.error(`exception when confirm order: ${error}`);
					return ConfirmStatus.Exception;
				}
			}
			return result_status;
		})();
		console.log(`confirm status: ${confirmStatus}`);
		setConfirmIng(false)
		setConfirmAgain(false)
		switch (confirmStatus) {
			case ConfirmStatus.Success:
				console.log('You got the name! please check it out from MyAccount');
				setConfirmStatus('success');
				deleteCache('getNamesOfRegistrant' + authWallet.walletAddress)
				deleteCache('namesOfController' + authWallet.walletAddress)
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
		if (blockHeight !== 0) { confirmOrderFunction() };
		return () => { setBlockHeight(0) };
	}, [blockHeight])// eslint-disable-line react-hooks/exhaustive-deps

	const payment = async (order) => {
		setPayIng(true)
		const arrayToHex = (arr: Array<number>) => {
			return arr.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
		}
		try {
			if (blockHeight === 0) {
				const payResult = await window.ic.plug.requestTransfer({
					to: arrayToHex(order.payment_account_id),
					amount: Number(order.price_icp_in_e8s),
					opts: {
						fee: 10000,
						memo: order.payment_memo.ICP.toString(),
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

	const checkOrder = async () => {
		if (payIng) return
		enum OrderStatus {
			Available,
			Disabled,
			NotOrder,
			Refund,
		}
		if (authWallet.walletAddress) {
			setCheckOrderIng(true)
			setModalVisible(true)
			const serviecOrderInfo: any = [];
			let orderStatus = await (async () => {
				let result_Status = OrderStatus.Available;
				const [availableResult, orderResult] = await Promise.all([serviceApi.available(orderInfo.name).catch(err => {
					setCheckOrderIng(false)
					setModalVisible(false)
					toast.error(err.message, {
						position: 'top-center',
						autoClose: 2000,
						theme: 'dark'
					})
				}), serviceApi.getPendingOrder()]);
				if (orderResult.length !== 0) {
					console.log(orderResult[0])
					serviecOrderInfo.push(orderResult[0])
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
					payment(serviecOrderInfo[0]);
					break;
				case OrderStatus.Disabled:
					setModalVisible(false);
					toast.error('The domain name is not available', {
						position: 'top-center',
						theme: 'dark'
					})
					break;
				case OrderStatus.NotOrder:
					setModalVisible(false);
					history.push('/myaccount');
					toast.error('no pending order', {
						position: 'top-center',
						theme: 'dark'
					})
					break;
				case OrderStatus.Refund:
					setModalVisible(false);
					checkRefund();
					break;
			}
		}
	}

	return (
		<React.Fragment>
			<Row>
				<Col md={4} sm={12}>Registration to Price</Col>
				<Col md={4} sm={12} className="text-center">{icpPayAmountDesc}</Col>
				<Col md={4} sm={12}></Col>
			</Row>
			<div className={payStyles['btn-pay-wrap']}>
				<CancelOrderIcp name={orderInfo.name} />
				{
					blockHeight === 0 &&
					<button className={`${styles.btn} ${payStyles['btn-pay-quota']}`} disabled={payIng} onClick={() => { checkOrder() }}>
						{modalVisible && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}Pay
					</button>
				}
			</div>

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
								<Timeline.Item type="ongoing">{checkOrderIng && <Spin size="small" />}Check order in progress</Timeline.Item>
								{
									!checkOrderIng && <Timeline.Item type="ongoing">{payIng && <Spin size="small" />}Payment in progress</Timeline.Item>
								}
								{
									checkOrderIng || payIng ? null :
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
								checkOrderIng || payIng ? null :
									!paymentResult &&
									<div className={payStyles['btn-wrap']}>
										<button className={payStyles['btn']} onClick={() => {
											setModalVisible(false)
											setCheckOrderIng(false)
											setPayIng(false)
											setPaymentResult(false)
											setConfirmIng(false)
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
										System Exception,<br /> please try confirm
									</div>
									<div className="d-grid gap-2">
										<button className={`${payStyles['btn']}  ${payStyles['btn-order']}`} disabled={confirmAgain} onClick={() => {
											setConfirmAgain(true)
											confirmOrderFunction()
										}}>{confirmAgain && <Spin size="middle" />}Confirm Order</button>
									</div>
								</React.Fragment>
							}
							{
								confirmStatus === 'fail' &&
								<React.Fragment>
									<div className={payStyles['confirm-msg']}>
										Fail confirm order, but payment success
									</div>
									<div className="d-grid gap-2">
										<button className={payStyles['btn']} onClick={() => { window.location.reload() }}>Reload current order</button>
									</div>
								</React.Fragment>
							}
						</React.Fragment>
				}
			</Modal>
		</React.Fragment>
	)
}