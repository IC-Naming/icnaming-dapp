import React, { useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styles from '../assets/styles/Name.module.scss'
// import { useAuthWallet } from "../context/AuthWallet";
// import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";
import {IC_NAMING_LEDGER_ID} from "../utils/canisters/icNamingLedger/canisterId";
import {createLedgerActor} from "../utils/canisters/ledger";
import {BlockIndex, Tokens} from "../utils/canisters/ledger/interface";
declare const window: any;

interface PayPorps {
  regname: string;
  payType: string;
  payYears: number;
  payQuota: number;
  order: any,
  hide: () => void;
}
export const Pay: React.FC<PayPorps> = ({ regname, payType, payYears, payQuota, order, hide }) => {
  // const { ...auth } = useAuthWallet();
  const history = useHistory();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [hasRefund, setHasRefund] = useState<boolean>(false)
  const serviceApi = new ServiceApi();
  const ledgerActor = createLedgerActor();
 /*  useEffect(() => {
    console.log(regname)
    console.log(payType)
    setLoadingSubmit(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regname]) */

  const payVidQuota = async () => {
    if (loadingSubmit) return
    setLoadingSubmit(true)
    if (payQuota) {
      serviceApi.registerNameByQuota(regname, payQuota).then(res => {
        if (res === true) {
          toast.success('success', {
            position: 'top-center',
            theme: 'dark'
          })
          setLoadingSubmit(false)
          history.push('/myaccount')
        } else {
          toast.success('fail register', {
            position: 'top-center',
            theme: 'dark'
          })
        }
      }).catch(err => {
        setLoadingSubmit(false)
        toast.error(err.message, {
          position: 'top-center',
          theme: 'dark'
        })

      })
    }
  }

  const payVidIcp = async () => {
    if (loadingSubmit) return
    let orderResult = await serviceApi.getPendingOrder();
    if (orderResult.length == 0) {
      toast.error('no pending order', {
        position: 'top-center',
        theme: 'dark'
      })
      return
    }
    let order = orderResult[0];
    const transfer_result = await ledgerActor.transfer({
      to:order.payment_account_id,
      memo:order.payment_memo.ICP,
      fee:{
        e8s:BigInt(10000)
      },
      amount:{
        e8s:order.price_icp_in_e8s
      },
      created_at_time:[],
      from_subaccount:[]
    });

    if ('Ok' in transfer_result){
      toast.success('Payment is successful, please wait for seconds, the system will confirm your payment, please do not repeat during this period',{
        position:'top-center',
        theme:'dark'
      })
    }else {
      let errorMessage = '';
      // create error message according to Err type
      let err = transfer_result.Err;
      if ('TxTooOld' in err) {
        errorMessage = 'Transaction is too old';
      } else if ('BadFee' in err) {
        errorMessage = 'Bad fee';
      } else if ('TxDuplicate' in err) {
        errorMessage = 'Transaction is duplicate';
      } else if ('TxCreatedInFuture' in err) {
        errorMessage = 'Transaction is created in future';
      } else if ('InsufficientFunds' in err) {
        errorMessage = 'Insufficient funds';
      } else {
        errorMessage = 'Unknown error';
      }

      toast.error(`fail transfer with error: ${errorMessage}`, {
        position: 'top-center',
        theme: 'dark'
      })
      return
    }
  }

  const cancelRegisterOrder = () => {
    if (loadingSubmit) return
    setLoadingSubmit(true)
    serviceApi.cancelRegisterOrder().then(res=>{
      if(res){
        setLoadingSubmit(false)
        toast.success('success',{
          position:'top-center',
          theme:'dark'
        })
        history.push('/')
      }
    }).catch(err=>{
      setLoadingSubmit(false)
      console.log('cancelRegisterOrder',err)
    })
  }

  return (

    <div className={`${styles['name-content']} ${styles['pay-content']}`}>
      <div className={styles.register}>
        <Row>
          <Col md={4} sm={12}>Registration Period </Col>
          <Col md={4} sm={12} className="text-center">
            {payYears}Years
          </Col>
          <Col md={4} sm={12}>
            {payQuota}
            {payType}
            {regname}
          </Col>
        </Row>

        {
          payType === 'quota' ?
            <>
              <Row>
                <Col md={4} sm={12}>Registration to pay</Col>
                <Col md={4} sm={12} className="text-center" >
                  <div style={{ whiteSpace: 'nowrap' }}>
                    1 Quota<span className="superscript">7</span> <span>(you have 3 Quota<span className="superscript">7</span>)</span>
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
                  <button className={styles.btn} onClick={() => { payVidIcp() }}>
                    {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                    Refund
                  </button>
                </div>
              </>
              :
              <>
                <Row>
                  <Col md={4} sm={12}>Registration to Price</Col>
                  <Col md={4} sm={12} className="text-center">0 ICP ≈ 2T Cycles</Col>
                  <Col md={4} sm={12}></Col>
                </Row>
                <div className="d-grid gap-2">
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button className={styles.btn} onClick={() => { cancelRegisterOrder() }} style={{ marginRight: 10 }}
                    >Cancel</button>
                    <button className={styles.btn} onClick={() => { }}>
                      {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                      Pay
                    </button>
                  </div>
                </div>
              </>
        }
      </div>
    </div>
  )
}