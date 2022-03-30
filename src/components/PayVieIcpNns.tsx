import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
// import { Modal, Spin, Input } from "@douyinfe/semi-ui";
import { Input, Banner } from "@douyinfe/semi-ui";
import { useHistory } from "react-router-dom";
// import styles from '../assets/styles/Name.module.scss'
import payStyles from '../assets/styles/Pay.module.scss'
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from "../utils/ServiceApi";
// import { deleteCache } from "../utils/localCache";
import { CancelOrderIcp } from "components/CancelOrderIcp";
import { CopyToClipboard } from "components/CopyToClipboard";
import BigNumber from "bignumber.js";
// import { useMyInfo } from "context/MyInfo";
import toast from "@douyinfe/semi-ui/lib/es/toast";
// declare var window: any;
interface IcpPayProps {
	orderInfo: {
		name: string,
		nameLen: number,
		payStatus: object,
		payYears: number,
	};
	checkRefund: () => void;
}

export const PayVieIcpNns: React.FC<IcpPayProps> = ({ orderInfo, checkRefund }) => {
	const history = useHistory();
	const serviceApi = new ServiceApi();
	const { ...authWallet } = useAuthWallet();
	// const { ...myInfo } = useMyInfo();
	const [checkOrderIng, setCheckOrderIng] = useState<boolean>(true)
	const [paymentInfo, setPaymentInfo] = useState<any>({ paymentAccountId: 0, paymentMemo: 0, years: 1, priceIcp: 0, cycles: 2 })
	const [nameAvailable, setNameAvailable] = useState<boolean>(false)

	const [blockHeight, setBlockHeight] = useState<string>('')
	/* 	const [submitLoading, setSubmitLoading] = useState<boolean>(false)
		const [confirmStatus, setConfirmStatus] = useState<'success' | 'fail' | 'exception'>('success')
		const [modalVisible, setModalVisible] = useState<boolean>(false)
		const [confirmAgain, setConfirmAgain] = useState<boolean>(false) */


	/* 	const confirmOrderFunction = async () => {
			toast.warning({
				content: 'Only plug wallet payment is supported for now',
				duration: 4,
			})
			return false;
			enum ConfirmStatus {
				Success,
				Fail,
				Exception
			}
			if (blockHeight === '') {
				toast.error('Please enter the payment block height')
				return
			}
			if (isNaN(Number(blockHeight))) {
				toast.error('Please enter the correct block height')
				return
			}
			setSubmitLoading(true)
			console.log('block_height-----------', blockHeight);
			console.assert(Number(blockHeight) > 0, 'blockHeight must be greater than 0');
			// get confirm status
			let confirmStatus = await (async () => {
				const max_retry = 3;
				let result_status = ConfirmStatus.Success;
				for (let i = 0; i < max_retry; i++) {
					try {
						let result = await serviceApi.confirmOrder(BigInt(blockHeight));
						console.log('confirmOrder result', result)
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
			setModalVisible(true);
			setSubmitLoading(false);
			setConfirmAgain(false)
			switch (confirmStatus) {
				case ConfirmStatus.Success:
					console.log('You got the name! please check it out from MyAccount');
					myInfo.cleanPendingOrder()
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
		}*/

	const checkOrder = async (name) => {
		enum OrderStatus {
			Available,
			Disabled,
			NotOrder,
			Refund,
		}
		if (authWallet.walletAddress) {
			setCheckOrderIng(true)
			const serviecOrderInfo: any = [];
			let orderStatus = await (async () => {
				let result_Status = OrderStatus.Available;
				const [availableResult, orderResult] = await Promise.all([serviceApi.available(name).catch(err => {
					console.log(err)
				}), serviceApi.getPendingOrder()]);
				if (orderResult.length !== 0) {
					serviecOrderInfo.push(orderResult[0])
					const arrayToHex = (arr: Array<number>) => {
						return arr.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
					}
					let nameLen = orderResult[0].name.replace('.icp', "").length
					nameLen = nameLen >= 7 ? 7 : nameLen;
					let cycles = 0;

					const icpToCycles = localStorage.getItem('icpToCycles')
					if (icpToCycles) {
						const icpToCyclesObj = JSON.parse(icpToCycles)
						cycles = icpToCyclesObj[nameLen - 1].cycles
					}
					setPaymentInfo({
						paymentAccountId: arrayToHex(orderResult[0].payment_account_id),
						paymentMemo: orderResult[0].payment_memo.ICP.toString(),
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
	}, [authWallet.walletAddress])// eslint-disable-line react-hooks/exhaustive-deps

	return (
		<React.Fragment>

			<Banner
				type="warning"
				description="Currently only plugWallet and StiocWallet are supported"
				closeIcon={null}
				className="mb-4"
			/>
			{
				checkOrderIng ? <div className="text-center"><div className="spinner-border text-primary" role="status"></div></div> :
					<>
						{
							nameAvailable ?
								<>
									<Row>
										<Col md={4} sm={12}>Registration Period </Col>
										<Col md={4} sm={12}> {paymentInfo.years} Years</Col>
										<Col md={4} sm={12}></Col>
									</Row>
									<Row>
										<Col md={4} sm={12}>Registration to Price</Col>
										<Col md={4} sm={12} ><div style={{
											whiteSpace: 'nowrap'
										}}>{paymentInfo.priceIcp} ICP<CopyToClipboard text={paymentInfo.priceIcp} /> ≈ {paymentInfo.cycles} T Cycles</div></Col>
										<Col md={4} sm={12}></Col>
									</Row>
									<Row>
										<Col md={4} sm={12}>Payment AccountId</Col>
										<Col md={8} sm={12}>
											<div className={payStyles['order-info']}>
												<span className={payStyles['order-info-text']}>{paymentInfo.paymentAccountId}</span>
												<CopyToClipboard text={paymentInfo.paymentAccountId} />
											</div>
										</Col>
									</Row>
									<Row>
										<Col md={4} sm={12}>Payment Memo</Col>
										<Col md={8} sm={12}>
											<div className={payStyles['order-info']}>
												<span className={payStyles['order-info-text']}>{paymentInfo.paymentMemo}</span>
												<CopyToClipboard text={paymentInfo.paymentMemo} />
											</div>
										</Col>
									</Row>
									<Row className="mb-5">
										<Col md={4} sm={12}>Block Height</Col>
										<Col md={4} sm={12} className={payStyles['block-height-wrap']} >
											<Input value={blockHeight} onChange={(e) => { setBlockHeight(e.replace(/[^0-9]/g, '')) }} />
										</Col>
										<Col md={4} sm={12}></Col>
									</Row>
								</> :
								<div className={payStyles['order-info-msg']}>
									The domain name is not available
								</div>
						}

						<div className={`${payStyles['btn-pay-wrap']}`}>
							<CancelOrderIcp name={orderInfo.name} />
							{/* {
								nameAvailable &&
								<button className={`${styles.btn} ${payStyles['btn-pay-icp']}`} disabled={false} title="Only plug wallet payment is supported for now" onClick={() => { confirmOrderFunction() }}>
									{submitLoading && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}Confirm
								</button>
							} */}
						</div>
					</>
			}


			{/* <Modal
				header={null}
				footer={null}
				visible={modalVisible}
				maskClosable={false}
				className={payStyles['modal-wrap-icpPay']}
			>
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
							System Exception,<br /> please retry to confirm payment
						</div>
						<div className="d-grid gap-2">
							<button className={`${payStyles['btn']}  ${payStyles['btn-order']}`} disabled={confirmAgain} onClick={() => {
								setConfirmAgain(false)
								setModalVisible(false)
							}}>{confirmAgain && <Spin size="middle" />}Cancel</button>
							<button className={`${payStyles['btn']}  ${payStyles['btn-order']}`} disabled={confirmAgain} onClick={() => {
								setConfirmAgain(true)
								confirmOrderFunction()
							}}>{confirmAgain && <Spin size="middle" />}Retry</button>
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
			</Modal> */}
		</React.Fragment>
	)
}