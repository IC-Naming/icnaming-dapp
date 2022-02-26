import React, { useState, useEffect } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styles from '../assets/styles/Name.module.scss'
import { ModalTipFull } from "../components/ModalTipFull";
import { useMyInfo } from "../context/MyInfo";
import ServiceApi from "../utils/ServiceApi";
declare var window: any;

export const Pay = (props) => {
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const { ...myInfo } = useMyInfo();

  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [loadingCancel, setLoadingCancel] = useState<boolean>(false);
  const [hasRefund, setHasRefund] = useState<boolean>(false)

  const [quotaTypeCount, setQuotaTypeCount] = useState<any>(0);
  const [icpPayAmountDesc, setIcpPayAmountDesc] = useState<string>('')
  const [quotaType, setQuotaType] = useState<number>(7)

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
    if (loadingSubmit) return
    setLoadingSubmit(true)
    if (quotaType) {
      serviceApi.registerNameByQuota(myInfo.orderInfo.name, quotaType).then(res => {
        if (res === true) {
          toast.success('success', {
            position: 'top-center',
            theme: 'dark'
          })
          setLoadingSubmit(false)
          myInfo.getMyQuotas();
          history.push('/myaccount')
        } else {
          errorToast('fail register');
        }
      }).catch(err => {
        setLoadingSubmit(false)
        errorToast(err.message)
      })
    }
  }

  const payVidIcp = async () => {
    if (loadingSubmit) return
    setLoadingSubmit(true)
    let orderResult = await serviceApi.getPendingOrder();
    console.log(orderResult)
    if (orderResult.length === 0) {
      errorToast('no pending order')
      return
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
      toast.success('Payment success! Please wait, the name is being picked up for you. ', {
        position: 'top-center',
        theme: 'dark'
      })
      let result = await serviceApi.confirmOrder(payResult.height);
      setLoadingSubmit(false)
      if (result) {
        toast.success('You got the name! please check it out from MyAccount', {
          position: 'top-center',
          theme: 'dark'
        })
      } else {
        errorToast('fail confirm order')
      }
    } catch (err) {
      setLoadingSubmit(false);
      errorToast(`fail transfer with error: ${err}`);
      return
    }
  }

  const cancelRegisterOrder = () => {
    if (loadingSubmit) return
    setLoadingCancel(true)
    serviceApi.cancelRegisterOrder().then(res => {
      if (res) {
        setLoadingCancel(false)
        toast.success('Cancel the success', {
          position: 'top-center',
          autoClose:1000,
          theme: 'dark'
        })
        myInfo.cleanPendingOrder()
        history.push(`/search/${myInfo.orderInfo.name.split('.')[0]}`)
      }
    }).catch(err => {
      setLoadingCancel(false)
      errorToast(err.message)
      console.log('cancelRegisterOrder', err)
    })
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
                      {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
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
                      <button className={styles.btn} onClick={() => { }}>
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
                          {loadingCancel && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
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
      <ModalTipFull visible={loadingCancel} text={'Cancellation order'} />
    </div>
    
  )
}