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
declare var window: any;

export const Pay = (props) => {
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const { ...myInfo } = useMyInfo();
  const { ...auth } = useAuthWallet();

  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [paymentQuota, setPaymentQuota] = useState<boolean>(false);
  const [loadingCancelOrder, setLoadingCancelOrder] = useState<boolean>(false);
  const [hasRefund, setHasRefund] = useState<boolean>(false)

  const [quotaTypeCount, setQuotaTypeCount] = useState<any>(0);
  const [quotaType, setQuotaType] = useState<number>(7)

  const [icpPayAmountDesc, setIcpPayAmountDesc] = useState<string>('')

  const [icpPayIng, setIcpPayIng] = useState<boolean>(true)
  const [icpPayStatus, setIcpPayStatus] = useState<boolean>(false)
  const [systemStatus, setSystemStatus] = useState<boolean>(false)

  const errorToast = (msg: string) => {
    toast.error(msg, {
      position: 'top-center',
      theme: 'dark'
    })
  }
  useEffect(() => {
    let nameLen = myInfo.orderInfo.nameLen >= 7 ? 7 : myInfo.orderInfo.nameLen;
    if (myInfo.orderInfo.payType === 'icp') {
      const icpToCycles = localStorage.getItem('icpToCycles')
      if (icpToCycles) {
        const icpToCyclesObj = JSON.parse(icpToCycles)
        setIcpPayAmountDesc(`${icpToCyclesObj[nameLen - 1].icp} ICP ≈ ${icpToCyclesObj[nameLen - 1].cycles} T Cycles`)
      }
    } else if (myInfo.orderInfo.quotaType) {
      setQuotaType(myInfo.orderInfo.quotaType)
      const myQuotas = localStorage.getItem('myQuotas');
      if (myQuotas) {
        const myQuotasObj = JSON.parse(myQuotas)
        setQuotaTypeCount(myQuotasObj[myInfo.orderInfo.quotaType - 4])
      }
    }
  }, [myInfo.orderInfo])

  const payVidQuota = async () => {
    if (paymentQuota) return
    setPaymentQuota(true)
    if (quotaType) {
      serviceApi.registerNameByQuota(myInfo.orderInfo.name, quotaType).then(res => {
        if (res === true) {
          toast.success('success', {
            position: 'top-center',
            theme: 'dark'
          })
          setPaymentQuota(false)
          myInfo.getMyQuotas();
          history.push('/myaccount')
          deleteCache('getNamesOfRegistrant' + auth.walletAddress)
          deleteCache('namesOfController' + auth.walletAddress)
        } else {
          errorToast('fail register');
        }
      }).catch(err => {
        setPaymentQuota(false)
        errorToast(err.message)
      })
    }
  }

  const payVidIcp = async () => {
    if (loadingSubmit) return
    setLoadingSubmit(true)
    setIcpPayIng(true)
    const available = await serviceApi.available(myInfo.orderInfo.name).catch(err => {
      errorToast(err.message)
    });
    const orderResultRes = await serviceApi.getPendingOrder();
    const [availableResult, orderResult] = await Promise.all([available, orderResultRes]);

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
      const accountId = arrayToHex(order.payment_account_id);
      console.log(`account id: ${accountId}`);
      const payResult = await window.ic.plug.requestTransfer({
        to: arrayToHex(order.payment_account_id),
        amount: Number(order.price_icp_in_e8s),
        opts: {
          fee: 10000,
          memo: order.payment_memo.ICP.toString(),
        },
      });
      console.log(`Pay success: ${JSON.stringify(payResult)}`);
      setIcpPayIng(false)
      setIcpPayStatus(true)
      console.log('Payment success! Please wait, the name is being picked up for you. ')
      let result = await serviceApi.confirmOrder(payResult.height);
      console.log('confirmOrder',result);
      if (result) {
        setSystemStatus(true)
        setIcpPayIng(true)
        deleteCache('getNamesOfRegistrant' + auth.walletAddress)
        deleteCache('namesOfController' + auth.walletAddress)
        setTimeout(() => { history.push('/myaccount')}, 3000);
        console.log('You got the name! please check it out from MyAccount')
      } else {
        setSystemStatus(false)
        console.log('fail confirm order')
      }
    } catch (err) {
      // setLoadingSubmit(false);
      setIcpPayIng(false)
      setIcpPayStatus(false)
      console.log(`fail transfer with error: ${err}`);
      return
    }
  }

  const cancelRegisterOrder = async () => {
    if (loadingSubmit) return
    setLoadingCancelOrder(true)
    serviceApi.cancelRegisterOrder().then(res => {
      if (res) {
        setLoadingCancelOrder(false)
        toast.success('Cancel the success', {
          position: 'top-center',
          autoClose: 1000,
          theme: 'dark'
        })
        myInfo.cleanPendingOrder()
        history.push(`/search/${myInfo.orderInfo.name.split('.')[0]}`)
      }
    }).catch(err => {
      if (err instanceof CanisterError) {
        setLoadingCancelOrder(false)
        errorToast(err.message)
      }
      console.log('cancelRegisterOrder', err)
    })
  }

  const refund = async () => {
    console.log('refund----------------')
  }

  return (
    <div className={styles['name-wrap']}>
      <div className="container pt-5">
        <div className={`${styles['name-content']} ${styles['pay-content']}`}>
          <h1 className={`${styles.title} text-right`}>{myInfo.orderInfo.name}</h1>
          <div className={styles.register}>
            <Row>
              <Col md={4} sm={12}>Registration Period </Col>
              <Col md={4} sm={12} className="text-center"> {myInfo.orderInfo.payYears} Years</Col>
              <Col md={4} sm={12}></Col>
            </Row>
            {
              myInfo.orderInfo.payType === 'quota' ?
                <>
                  <Row>
                    <Col md={4} sm={12}>Registration to pay</Col>
                    <Col md={4} sm={12} className="text-center" >
                      <div style={{ whiteSpace: 'nowrap' }}>
                        {myInfo.orderInfo.payYears} Quota<span className={styles['superscript']}>{quotaType}</span>
                        <span style={{ color: '#999', paddingLeft: 10 }}> ( you have {quotaTypeCount} Quota<span className={styles['superscript']}>{quotaType}</span> )</span>
                      </div>
                    </Col>
                    <Col md={4} sm={12}></Col>
                  </Row>
                  <div className="d-grid gap-2">
                    <button className={styles.btn} onClick={() => { payVidQuota() }}>
                      {paymentQuota && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                      Submit
                    </button>
                  </div>
                </>
                :
                hasRefund ?
                  <>
                    <Row>
                      <Col md={12} sm={12}>
                        <p className="text-center">Unfortunately,name is registered by someone else</p>
                      </Col>
                    </Row>
                    <div className="d-grid gap-2">
                      <button className={styles.btn} onClick={() => { refund() }}>
                        {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                        Refund
                      </button>
                    </div>
                  </>
                  :
                  <>
                    <Row>
                      <Col md={4} sm={12}>Registration to Price</Col>
                      <Col md={4} sm={12} className="text-center">{icpPayAmountDesc}</Col>
                      <Col md={4} sm={12}></Col>
                    </Row>
                    <div className="d-grid gap-2">
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button className={styles.btn} onClick={() => { cancelRegisterOrder() }} style={{ marginRight: 10 }}
                        >
                          {loadingCancelOrder && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                          Cancel</button>
                        <button className={styles.btn} onClick={() => { payVidIcp() }}>
                          {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                          Pay
                        </button>
                      </div>
                    </div>
                  </>
            }
          </div>
        </div>
      </div>
      <ModalTipFull visible={loadingCancelOrder || paymentQuota} text={loadingCancelOrder ? 'Order is cancelling' : 'Payment in progress'} />

      <Modal
        header={null}
        footer={null}
        visible={loadingSubmit}
        maskClosable={false}
        className={payStyles['modal-wrap-icpPay']}
      >
        <Timeline className={payStyles['paymentIcpTimeline']}>
          {
            !systemStatus && <Timeline.Item type="ongoing">
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
                <Timeline.Item type="error">Payment failure</Timeline.Item>
          }
        </Timeline>
        {
          icpPayIng ? null :
            !icpPayStatus &&
            <div className={payStyles['btn-wrap']}>
              <button className={payStyles['btn']} onClick={() => { setLoadingSubmit(false) }}>
                cancel
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
          systemStatus && <div className={payStyles['success-icpreg']}>
            Congratulations! Now you are the owner of <br />{myInfo.orderInfo.name}!
          </div>
        }
      </Modal>
    </div>
  )
}