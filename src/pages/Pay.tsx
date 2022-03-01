import React, { useState, useEffect } from "react";
import { Modal, Timeline, Spin } from "@douyinfe/semi-ui";
import { Row, Col, Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styles from '../assets/styles/Name.module.scss'
import payStyles from '../assets/styles/Pay.module.scss'
import { ModalTipFull } from "../components/ModalTipFull";
import { useMyInfo } from "../context/MyInfo";
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from "../utils/ServiceApi";
import { CanisterError } from "../utils/exception";
import { deleteCache } from "../utils/localCache";
import { PayVieQuota } from "components/PayVieQuota";
import { Refund } from "components/Refund";
declare var window: any;

export const Pay = (props) => {
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const { ...myInfo } = useMyInfo();
  const { ...auth } = useAuthWallet();

  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [loadingCancelOrder, setLoadingCancelOrder] = useState<boolean>(false);
  const [hasRefund, setHasRefund] = useState<boolean>(false)

  const [quotaTypeCount, setQuotaTypeCount] = useState<any>(0);
  const [quotaType, setQuotaType] = useState<number>(7)

  const [icpPayAmountDesc, setIcpPayAmountDesc] = useState<string>('')
  const [icpPayIng, setIcpPayIng] = useState<boolean>(true)
  const [icpPayStatus, setIcpPayStatus] = useState<boolean>(false)
  const [systemStatusSuccess, setSystemStatusSuccess] = useState<boolean>(false)

  const [visiableModalTipFull, setVisiableModalTipFull] = useState<boolean>(false)
  const [textModalTipFull, setTextModalTipFull] = useState<string>('')
  const [orderInfoObj, setOrderInfoObj] = useState<{ name: string, nameLen: number, payStatus: object, payYears: number, payType: 'icp' | 'quota', quotaType?: number }>({
    name: '',
    nameLen: 0,
    payStatus: {},
    payYears: 1,
    payType: 'icp',
  })
  const errorToast = (msg: string) => {
    toast.error(msg, {
      position: 'top-center',
      theme: 'dark'
    })
  }
  useEffect(() => {
    const orderInfo = localStorage.getItem('orderInfo');
    if (orderInfo) {
      const orderInfoObj = JSON.parse(orderInfo)
      setOrderInfoObj(orderInfoObj)
      console.log('pay myInfo', orderInfoObj)
      let nameLen = orderInfoObj.name.replace('.icp', "").length;
      nameLen = nameLen >= 7 ? 7 : nameLen;
      if (orderInfoObj.payType === 'icp') {
        const icpToCycles = localStorage.getItem('icpToCycles')
        if (icpToCycles) {
          const icpToCyclesObj = JSON.parse(icpToCycles)
          console.log(`${icpToCyclesObj[nameLen - 1].icp} ICP ≈ ${icpToCyclesObj[nameLen - 1].cycles} T Cycles`)
          setIcpPayAmountDesc(`${icpToCyclesObj[nameLen - 1].icp} ICP ≈ ${icpToCyclesObj[nameLen - 1].cycles} T Cycles`)
        }
        if ("WaitingToRefund" in orderInfoObj.payStatus) {
          setHasRefund(true)
        }
      } else if (orderInfoObj.quotaType) {
        setQuotaType(orderInfoObj.quotaType)
        const myQuotas = localStorage.getItem('myQuotas');
        if (myQuotas) {
          const myQuotasObj = JSON.parse(myQuotas)
          setQuotaTypeCount(myQuotasObj[orderInfoObj.quotaType - 4])
        }
      }
    }
  }, [])

  const payVidIcp = async () => {
    if (loadingSubmit) return
    setLoadingSubmit(true)
    setIcpPayIng(true)
    const [availableResult, orderResult] = await Promise.all([serviceApi.available(orderInfoObj.name).catch(err => {
      errorToast(err.message)
    }), serviceApi.getPendingOrder()]);

    if (availableResult !== true) {
      toast.warning('name is not available', {
        position: 'top-center',
        autoClose: 2000,
        theme: 'dark'
      })
      return
    } else {
      if (orderResult.length === 0) {
        errorToast('no pending order')
        return
      } else if ("WaitingToRefund" in orderResult[0].status) {
        setHasRefund(true)
        return
      }
    }
    let order = orderResult[0];
    const arrayToHex = (arr: Array<number>) => {
      return arr.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
    }
    try {
      const payResult = await window.ic.plug.requestTransfer({
        to: arrayToHex(order.payment_account_id),
        amount: Number(order.price_icp_in_e8s),
        opts: {
          fee: 10000,
          memo: order.payment_memo.ICP.toString(),
        },
      });
      console.log(`Pay success: ${JSON.stringify(payResult)}`);
      try {
        let result = await serviceApi.confirmOrder(payResult.height);
        console.log('confirmOrder', result);
        if (result) {
          setSystemStatusSuccess(true)
          setIcpPayIng(false)
          setIcpPayStatus(true)
          setTimeout(() => { history.push('/myaccount') }, 3000);
          console.log('You got the name! please check it out from MyAccount')
        } else {
          console.log('fail confirm order, but payment success')
          throw new Error("failed to confirm from api");
        }
      }
      catch (err) {
        console.log(`fail confirm order, ${JSON.stringify(err)}`);
        throw err;
      }
      finally {
        deleteCache('getNamesOfRegistrant' + auth.walletAddress)
        deleteCache('namesOfController' + auth.walletAddress)
      }
    } catch (err) {
      setIcpPayIng(false)
      setIcpPayStatus(false)
      console.log(`Payment failed: ${JSON.stringify(err)}`);
      return
    }
  }

  const cancelRegisterOrder = async () => {
    if (loadingSubmit) return
    setLoadingCancelOrder(true)
    setVisiableModalTipFull(true)
    setTextModalTipFull('Order is cancelling')
    serviceApi.cancelRegisterOrder().then(res => {
      if (res) {
        setLoadingCancelOrder(false)
        setVisiableModalTipFull(false)
        toast.success('Order cancelled success', {
          position: 'top-center',
          autoClose: 1000,
          theme: 'dark'
        })
        myInfo.cleanPendingOrder();
        localStorage.removeItem('orderInfo');
        history.push(`/search/${orderInfoObj.name.split('.')[0]}`);
      }
    }).catch(err => {
      if (err instanceof CanisterError) {
        setLoadingCancelOrder(false)
        setVisiableModalTipFull(false)
        errorToast(err.message)
      }
      console.log('cancelRegisterOrder', err)
    })
  }

  return (
    <div className={styles['name-wrap']}>
      <div className="container pt-5">
        <div className={`${styles['name-content']} ${styles['pay-content']}`}>
          <h1 className={`${styles.title} text-right`}>{orderInfoObj.name}</h1>
          <div className={styles.register}>
            <Row>
              <Col md={4} sm={12}>Registration Period </Col>
              <Col md={4} sm={12} className="text-center"> {orderInfoObj.payYears} Years</Col>
              <Col md={4} sm={12}></Col>
            </Row>
            {
              orderInfoObj.payType === 'quota' ?
                <PayVieQuota quotaType={quotaType} quotaTypeCount={quotaTypeCount} />
                :
                hasRefund ?
                  <Refund />
                  :
                  <>
                    <Row>
                      <Col md={4} sm={12}>Registration to Price</Col>
                      <Col md={4} sm={12} className="text-center">{icpPayAmountDesc}</Col>
                      <Col md={4} sm={12}></Col>
                    </Row>
                    <div className={payStyles['btn-pay-wrap']}>
                      <button className={`${styles.btn} ${payStyles['btn-pay-quota']}`} onClick={() => { cancelRegisterOrder() }} style={{ marginRight: 10 }}
                      >
                        {loadingCancelOrder && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                        Cancel</button>
                      <button className={`${styles.btn} ${payStyles['btn-pay-quota']}`} onClick={() => { payVidIcp() }}>
                        {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                        Pay
                      </button>
                    </div>
                  </>
            }
          </div>
        </div>
      </div>
      <ModalTipFull visible={visiableModalTipFull} text={textModalTipFull} />

      <Modal
        header={null}
        footer={null}
        visible={loadingSubmit}
        maskClosable={false}
        className={payStyles['modal-wrap-icpPay']}
      >
        <Timeline className={payStyles['paymentIcpTimeline']}>
          {
            !systemStatusSuccess && <Timeline.Item type="ongoing">
              {
                icpPayIng && <Spin size="small" />
              }
              Payment in progress</Timeline.Item>
          }
          {
            icpPayIng ? null :
              icpPayStatus ?
                <React.Fragment>
                  <Timeline.Item type="success">Payment success</Timeline.Item>
                  <Timeline.Item color="pink">
                    <Spin size="small" />
                    It's almost done, ICNaming is doing the final confirmation.</Timeline.Item>
                </React.Fragment>
                :
                <Timeline.Item type="error">
                  Failed to transfer or confirm, please DO NOT retry to pay before checking your balance. If you find out your balance is taken, please wait and check in "My Account" page by refreshing, your order will be confirmed automatically by system within 5 minutes.
                </Timeline.Item>
          }
        </Timeline>
        {
          icpPayIng ? null :
            !icpPayStatus &&
            <div className={payStyles['btn-wrap']}>
              <button className={payStyles['btn']} onClick={() => { setLoadingSubmit(false) }}>
                Cancel
              </button>
              <button className={payStyles['btn']} style={{ marginLeft: 10 }}
                onClick={() => { setLoadingSubmit(false) }}
              >
                {
                  icpPayIng && <Spin size="small" />
                }
                Continue to pay
              </button>
            </div>
        }
        {
          systemStatusSuccess && <div className={payStyles['success-icpreg']}>
            Congratulations! Now you are the owner of <br />{orderInfoObj.name}!
          </div>
        }
      </Modal>
    </div>
  )
}