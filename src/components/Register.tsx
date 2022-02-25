import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { Row, Col, Spinner } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss'
import { useAuthWallet } from "../context/AuthWallet";
import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";
import { useHistory } from "react-router-dom";
// import { SubmitOrderResponse } from "../utils/canisters/registrar/interface";
import BigNumber from "bignumber.js";
// import { deleteCache } from '../utils/localCache';
import { ConnectWallets } from ".";
import { Select, Avatar } from '@douyinfe/semi-ui';
import { PendingOrderTip } from "./PendingOrderTip";
const Option = Select.Option;

interface RegProps {
  regname: string;
  available: boolean;
}
export const Register: React.FC<RegProps> = ({ regname, available }) => {
  let nameLen = regname.split('.')[0].length >= 7 ? 7 : regname.split('.')[0].length;
  const { ...auth } = useAuthWallet();
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const [showWallets, setShowWallets] = useState(false);
  const [pendingOrderTipVisible, setPendingOrderTipVisible] = useState(false);


  const [calculating, setCalculating] = useState<boolean>(true);
  const [price, SetPrice] = useState<any>(0)
  const [cyclesPrice, SetCyclesPrice] = useState<any>(0)

  const [quotas, setQuotas] = useState<Array<number>>([]);
  const [loadingQuotas, setLoadingQuotas] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  
  const registerVidIcp = async () => {
    if (loadingSubmit || calculating) return
    setLoadingSubmit(true)
    serviceApi.getPendingOrder().then(res => {
      if (res.length !== 0){
        setPendingOrderTipVisible(true)
      }else{
        serviceApi.submitRegisterOrder(regname, 1).then(res => {
          console.log('registerVidIcp',res)
          if (res) {
            setLoadingSubmit(false)
            history.push('/pay')
          }
        }).catch(err => {
          console.log(err)
          setLoadingSubmit(false)
        })
      }
    })
  }

  const registerVidQuota = async (e) => {
    if (quotas[e - 4] > 0) {
      if (nameLen >= e) {
        // setPayQuotaLen(e)
      } else {
        toast.error(`Name must be at least ${nameLen} characters long`, {
          position: 'top-center',
          theme: 'dark'
        })
      }
    } else {
      toast.error(`Has no quota for len_gte ${e}`, {
        position: 'top-center',
        theme: 'dark'
      })
    }
  }

  useEffect(() => {
    serviceApi.getIcpToCycles(nameLen).then(res => {
      SetPrice(new BigNumber(res.price_in_icp_e8s.toString()).div(100000000).toString())
      SetCyclesPrice(new BigNumber(res.price_in_xdr_permyriad.toString()).div(10000).toString())
      setCalculating(false)
    }).catch(err => {
      setCalculating(false)
      console.log(err)
    })
    return () => {
      setCalculating(false)
      SetPrice(0)
      SetCyclesPrice(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regname])

  useEffect(() => {
    const checkMyQuotas = async () => {
      setLoadingQuotas(true)
      if (auth.walletAddress && auth.principal) {
        const get_MyQuotas = (user: Principal) => {
          const quota4 = serviceApi.getQuota(user, 4);
          const quota5 = serviceApi.getQuota(user, 5);
          const quota6 = serviceApi.getQuota(user, 6);
          const quota7 = serviceApi.getQuota(user, 7);
          return Promise.all([quota4, quota5, quota6, quota7])
        }
        const res = await get_MyQuotas(auth.principal);
        setQuotas(res)
        setLoadingQuotas(false)
      } else {
        setLoadingQuotas(false)
      }
    }
    checkMyQuotas()
    return () => {
      setQuotas([])
      setLoadingQuotas(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.walletAddress])

  return (
    <div className={styles.register}>
      {
        !available ?
          <div style={{ textAlign: 'center', paddingTop: '.9rem' }}>This name is already registered</div>
          : <>
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
                <div style={{ whiteSpace: 'nowrap' }}>
                  {
                    calculating
                      ?
                      <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />
                      : `${price} ICP ≈ ${cyclesPrice}T Cycles / Year`
                  }
                </div>
              </Col>
              <Col md={4} sm={12}>{/* <p className={styles['text-right']}>ICP</p> */}</Col>
            </Row>
            {
              !auth.walletAddress
                ?
                <div className="d-grid gap-2">
                  <button className={styles.btn} onClick={() => { setShowWallets(true) }}>Connnect ICP Wallet</button>
                </div>
                :
                loadingQuotas ?
                  <div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>
                  :
                  <div className={styles['btn-wrap']}>

                    <button
                      className={`${styles.btn} ${styles['btn-via-icp']}`}
                      onClick={registerVidIcp}>
                      {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                      Register via ICP</button>
                    <Select size='large' className={styles['selcet-quota']}
                      placeholder="please choose you quota"
                      onChange={(e) => {
                        registerVidQuota(e)
                      }}>
                      <Option>Register via Quota</Option>
                      {
                        quotas.map((quota, index) => {
                          return <Option className={styles['quota-option']} key={index} value={index + 4}>
                            <div className={styles['quota-option-con']}>
                              <Avatar shape='square' className={styles['quota-option-avatar']}>
                                Length-{index + 4}
                              </Avatar>
                              <span className={styles['quota-num']}>{quota}</span>
                            </div>
                          </Option>
                        })
                      }
                    </Select>
                  </div>
            }
          </>
      }
      <ConnectWallets visible={showWallets} hide={() => { setShowWallets(false) }} />
      <PendingOrderTip visible={pendingOrderTipVisible} hide={() => { setPendingOrderTipVisible(false) }} />
    </div>

  )
}