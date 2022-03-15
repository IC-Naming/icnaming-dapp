import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss'
import { useAuthWallet } from "../context/AuthWallet";
import { useMyInfo } from "../context/MyInfo";
import ServiceApi from "../utils/ServiceApi";
import { useHistory } from "react-router-dom";
import { ConnectWallets } from ".";
import { PendingOrderTip } from "./PendingOrderTip";
import { CanisterError } from "../utils/exception";
import { Select } from '@douyinfe/semi-ui';
import { ModalTipFull } from "./ModalTipFull";
import toast from "@douyinfe/semi-ui/lib/es/toast";
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
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [icpToCycles, SetIcpToCycles] = useState<string>('');
  const [quotas, setQuotas] = useState<Array<any>>([]);
  const [quotaLoading, setQuotaLoading] = useState<boolean>(false);
  const [recomQuota, setRecomQuota] = useState<number>(0);
  const errorToast = (msg: string) => {
    toast.error(msg)
  }

  const registerVidIcp = async () => {
    if (loadingSubmit) return
    if (myInfo.hasPendingOrder) {
      setPendingOrderTipVisible(true)
    } else {
      if (regname.split('.')[0].length >= 7) {
        setLoadingSubmit(true)
        serviceApi.submitRegisterOrder(regname, 1).then(res => {
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
            } else if (err.code === 26) {
              errorToast(err.message)
            } else {
              errorToast(err.message)
            }
          }
        })
      } else {
        errorToast(' Name length must more than or equal 7')
      }
    }
  }

  const registerVidQuota = async (e) => {
    // console.log('registerVidQuota',e)
    if (myInfo.hasPendingOrder) {
      setPendingOrderTipVisible(true)
    } else {
      if (nameLen >= e) {
        myInfo.createOrder({ name: regname, nameLen: nameLen, payStatus: {}, payYears: 1, payType: 'quota', quotaType: e });
        history.push(`/pay`);
        return
      } else {
        errorToast(`Name must be at least ${nameLen} characters long`)
      }
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
    if (auth.isAuthWalletConnected) {
      const myQuotas = localStorage.getItem('myQuotas');
      if (myQuotas && myQuotas.length > 0) {
        const myQuotasArr = JSON.parse(myQuotas)
        let newData: any = [];
        for (let i = 0; i < myQuotasArr.length; i++) {
          if (myQuotasArr[i] > 0) {
            newData.push({ quotaType: i + 4, quotaCount: myQuotasArr[i] })
          }
        }
        setQuotas(newData)
        setQuotaLoading(false)
        const canQuota = newData.filter(quota => quota.quotaType <= nameLen)
        setRecomQuota(Math.max(...canQuota.map(quota => quota.quotaType)))
      } else {
        setQuotaLoading(true)
        myInfo.getMyQuotas();
      }
    }
    return () => {
      setQuotas([])
      setQuotaLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthWalletConnected, myInfo.quotas]);

  // filter quota when count is 0
  const avaliableQuotas = useMemo(() => {
    return quotas.filter(quota => quota.quotaCount !== 0);
  }, [quotas]);

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
              !auth.isAuthWalletConnected
                ?
                <div className="d-grid gap-2">
                  <button className={styles.btn} onClick={() => { setShowWallets(true) }}>Connnect Wallet</button>
                </div>
                :
                <div className={`${styles['btn-wrap']} ${styles['btn-reg-wrap']}`}>
                  {
                    nameLen > 6 ?
                      <button
                        className={`${styles.btn} ${styles['btn-via-icp']}`} onClick={registerVidIcp}
                        disabled={auth.walletType === 'nns'}
                        title={auth.walletType === 'nns' ? 'This feature is not available for NNS wallet' : ''}
                      >
                        {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                        Register via ICP
                      </button>
                      :
                      <button className={`${styles.btn} ${styles['btn-via-icp']}`} style={{fontSize:14}} disabled={true}>
                        Register via ICP (Not open yet)
                      </button>
                  }

                  {
                    quotaLoading ?
                      <div className={styles['selcet-quota-wrap']}>
                        <div className="text-center"><Spinner animation="border" size="sm" style={{ marginRight: 10 }} />quota Loading</div>
                      </div>
                      :
                      avaliableQuotas.length > 0 &&
                      <div className={styles['selcet-quota-wrap']}>
                        <Select size='large' className={styles['selcet-quota']}
                          placeholder="Please choose your quota"
                          onChange={(e) => {
                            registerVidQuota(e)
                          }}>
                          {
                            avaliableQuotas.map((quota, index) => {
                              return <Option showTick={false} className={styles['quota-option-item']} key={index} value={quota.quotaType}>
                                <div className={styles['quota-option-con']}>
                                  <span className={styles['quota-option-type']}>
                                    [Length-{quota.quotaType}]
                                  </span>
                                  <span className={styles['quota-count']}>{quota.quotaCount}</span>
                                </div>
                                {
                                  recomQuota === quota.quotaType && <span className={styles['recommend']}>recom</span>
                                }
                              </Option>
                            })
                          }
                        </Select>
                      </div>
                  }
                </div>
            }
          </React.Fragment>
      }
      <ConnectWallets visible={showWallets} hide={() => { setShowWallets(false) }} />
      <PendingOrderTip visible={pendingOrderTipVisible}
        hide={() => { setPendingOrderTipVisible(false) }}
      />
      <ModalTipFull visible={loadingSubmit} text={'Creating Order'} />

    </div>
  )
}
