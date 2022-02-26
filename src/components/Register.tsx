import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss'
import { useAuthWallet } from "../context/AuthWallet";
import { useMyInfo } from "../context/MyInfo";
import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";
import { useHistory } from "react-router-dom";
// import { deleteCache } from '../utils/localCache';
import { ConnectWallets } from ".";
import { PendingOrderTip } from "./PendingOrderTip";
import { CanisterError } from "../utils/exception";
import { Select, Avatar } from '@douyinfe/semi-ui';
import { ModalTipFull } from "./ModalTipFull";
const Option = Select.Option;
interface RegProps {
  regname: string;
  available: boolean;
}
export const Register: React.FC<RegProps> = ({ regname, available }) => {
  let nameLen = regname.split('.')[0].length >= 7 ? 7 : regname.split('.')[0].length;
  const { ...auth } = useAuthWallet();
  const { ...myInfo } = useMyInfo();
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const [showWallets, setShowWallets] = useState<boolean>(false);
  const [pendingOrderTipVisible, setPendingOrderTipVisible] = useState<boolean>(false);
  const [loadingPending, setLoadingPending] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [icpToCycles, SetIcpToCycles] = useState<string>('');
  const [quotas, setQuotas] = useState<Array<number>>([]);

  const [recomQuota, setRecomQuota] = useState<number>(0);
  const errorToast = (msg: string) => {
    toast.error(msg, {
      position: 'top-center',
      autoClose: 1000,
      theme: 'dark',
    })
  }

  const calculateRecomQuota = async (myQuotasArr) => {
    for (let i = 0; i < myQuotasArr.length; i++) {
      console.log(i + 4, myQuotasArr[i])
      console.log('nameLen', nameLen ==i + 4)
      if (myQuotasArr[i] > 0 && nameLen == i + 4) {
        setRecomQuota(myQuotasArr[i])
        break;
      }
    }
  }

  const registerVidIcp = async () => {
    if (loadingSubmit) return
    if (regname.split('.')[0].length >= 7) {
      setLoadingSubmit(true)
      serviceApi.submitRegisterOrder(regname, 1).then(res => {
        console.log('registerVidIcp', res)
        if (res) {
          setLoadingSubmit(false)
          myInfo.createOrder({
            name: res.order.name,
            nameLen: res.order.name.split('.')[0].length,
            payYears: res.order.years,
            payStatus: res.order.status,
            payType: 'icp'
          });
          history.push(`/pay`)
        }
      }).catch(err => {
        console.log(err)
        setLoadingSubmit(false)
        if (err instanceof CanisterError) {
          if (err.code === 22) {
            setPendingOrderTipVisible(true)
          } else {
            errorToast(err.message)
          }
        }
      })
    } else {
      errorToast('Name length must less than 7')
    }
  }

  const registerVidQuota = async (e) => {
    // if qouta length is 0, return
    if (quotas[e - 4] > 0) {
      if (nameLen >= e) {
        myInfo.createOrder({ name: regname, nameLen: nameLen, payStatus: {}, payYears: 1, payType: 'quota', quotaType: e });
        history.push(`/pay`);
        return
      } else {
        errorToast(`Name must be at least ${nameLen} characters long`)
      }
    } else {
      errorToast(`Has no quota for len_gte ${e}`)
    }
  }

  useEffect(() => {
    const icpToCycles = localStorage.getItem('icpToCycles')
    if (icpToCycles) {
      const icpToCyclesObj = JSON.parse(icpToCycles)
      SetIcpToCycles(`${icpToCyclesObj[nameLen - 1].icp} ICP ≈ ${icpToCyclesObj[nameLen - 1].cycles} T Cycles / Year`)
    } else {
      SetIcpToCycles('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regname, myInfo.icpToCycles])

  useEffect(() => {
    if (auth.principal) {
      const myQuotas = localStorage.getItem('myQuotas');
      if (myQuotas && myQuotas.length > 0) {
        const myQuotasArr = JSON.parse(myQuotas)
        setQuotas(myQuotasArr)
        calculateRecomQuota(myQuotasArr)
      } else if (myInfo.quotas.length > 0) {
        console.log(myInfo.quotas)
      }
    }
    return () => {
      setQuotas([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.principal, myInfo.quotas])

  useEffect(() => {
    // if available is true, then show the check pending order modal
    if (auth.walletAddress && available) {
      setLoadingPending(true)
      console.log('check pending order', myInfo.hasPendingOrder)
      myInfo.checkPendingOrder()
      if (myInfo.hasPendingOrder) {
        setLoadingPending(false)
        setPendingOrderTipVisible(true)
      } else {
        setLoadingPending(false)
      }
    }
    return () => {
      setLoadingPending(false)
      setPendingOrderTipVisible(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.walletAddress, available, myInfo.hasPendingOrder])

  return (
    <div className={styles.register}>
      {
        !available ?
          <div style={{ textAlign: 'center', paddingTop: '.9rem' }}>This name is already registered</div>
          : <React.Fragment>
            <Row>
              <Col md={4} sm={12}>Registration Period </Col>
              <Col md={4} sm={12} className="text-center">
                <input value="1" className={`${styles['text-input']} ${styles['disabled']}`} disabled />
              </Col>
              <Col md={4} sm={12}><p className={styles['text-right']}>Years</p></Col>
            </Row>
            <Row style={{ marginBottom: '1.5rem' }}>
              <Col md={4} sm={12}>Registration Price</Col>
              <Col md={4} sm={12} className="text-center">
                {
                  icpToCycles ? <p style={{ whiteSpace: 'nowrap' }}>{icpToCycles}</p> : <Spinner animation="border" size="sm" />
                }
              </Col>
              <Col md={4} sm={12}></Col>
            </Row>
            {
              !auth.walletAddress
                ?
                <div className="d-grid gap-2">
                  <button className={styles.btn} onClick={() => { setShowWallets(true) }}>Connnect Wallet</button>
                </div>
                :
                quotas.length === 0 ?
                  <div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>
                  :
                  <div className={styles['btn-wrap']}>
                    <button
                      className={`${styles.btn} ${styles['btn-via-icp']}`}
                      onClick={registerVidIcp}>
                      {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                      Register via ICP
                    </button>

                    <Select size='large' className={styles['selcet-quota']}
                      placeholder="Please choose you quota"
                      onChange={(e) => {
                        registerVidQuota(e)
                      }}>
                      <Option>Please choose you quota</Option>
                      {
                        quotas.length > 0 &&
                        quotas.map((quota, index) => {
                          return <Option className={styles['quota-option']} key={index} value={index + 4}>
                            <div className={styles['quota-option-con']}>
                              <Avatar shape='square' className={styles['quota-option-avatar']}>
                                {/* Length<span className={styles['superscript']}>{index + 4}</span> */}
                                Length-{index + 4}
                              </Avatar>
                              <span className={styles['quota-num']}>{quota} - {recomQuota}</span>
                            </div>
                            
                            {/* {
                              recomQuota === index + 4 && <span className={styles['recommend']}>recom</span>
                            } */}
                          </Option>
                        })
                      }
                    </Select>
                  </div>
            }
          </React.Fragment>
      }
      <ConnectWallets visible={showWallets} hide={() => { setShowWallets(false) }} />
      <PendingOrderTip visible={pendingOrderTipVisible}
        hide={() => { setPendingOrderTipVisible(false) }}
      />
      <ModalTipFull visible={loadingPending || loadingSubmit} text={
        loadingPending ? 'check your pendingOrder' : 'Creating an order'} />

    </div>
  )
}
