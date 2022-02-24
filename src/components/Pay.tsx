import React, { useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styles from '../assets/styles/Name.module.scss'
// import { useAuthWallet } from "../context/AuthWallet";
// import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";

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
    console.log(order)

    toast.success('success,please',{
      position:'top-center',
      theme:'dark'
    })
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