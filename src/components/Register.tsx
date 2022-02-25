import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { Row, Col, Spinner } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss'
import { useAuthWallet } from "../context/AuthWallet";
import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";
import { useHistory } from "react-router-dom";
import BigNumber from "bignumber.js";
// import { deleteCache } from '../utils/localCache';
import { ConnectWallets } from ".";
import { PendingOrderTip } from "./PendingOrderTip";
import { CanisterError } from "../utils/exception";
import { Select, Avatar, Modal, Spin } from '@douyinfe/semi-ui';
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

  const [name, setName] = useState<string>(regname)
  const [calculating, setCalculating] = useState<boolean>(true);
  const [price, SetPrice] = useState<any>(0)
  const [cyclesPrice, SetCyclesPrice] = useState<any>(0)

  const [quotas, setQuotas] = useState<Array<number>>([]);
  const [loadingPending, setLoadingPending] = useState<boolean>(false);
  const [loadingQuotas, setLoadingQuotas] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

  const registerVidIcp = async () => {
    if (loadingSubmit || calculating) return
    setLoadingSubmit(true)
    serviceApi.submitRegisterOrder(name, 1).then(res => {
      console.log('registerVidIcp', res)
      if (res) {
        setLoadingSubmit(false)
        history.push(`/pay/icp/${name}/0`)
      }
    }).catch(err => {
      console.log(err)
      setLoadingSubmit(false)
      if (err instanceof CanisterError) {
        if (err.code === 22) {
          setPendingOrderTipVisible(true)
        } else {
          toast.error(err.message, {
            position: 'top-center',
            theme: 'dark'
          })
        }
      }
    })
  }

  const registerVidQuota = async (e) => {
    if (quotas[e - 4] > 0) {
      if (nameLen >= e) {
        history.push(`/pay/quota/${name}/${e}`)
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

  const checkMyQuotas = async () => {
    setLoadingQuotas(true)
    if (auth.principal) {
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

  const checkPendingOrder = async () => {
    setLoadingPending(true)
    serviceApi.getPendingOrder().then(res => {
      setLoadingPending(false)
      if (res.length !== 0) {
        setPendingOrderTipVisible(true)
        setName(res[0].name)
      } else {
        checkMyQuotas()
      }
    })
  }

  useEffect(() => {
    console.log('available & have walletAddress', auth.walletAddress && !available)
    if (auth.walletAddress && !available) {
      checkPendingOrder()
    }
    return () => {
      setQuotas([])
      setLoadingQuotas(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.walletAddress, available])

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
                  <button className={styles.btn} onClick={() => { setShowWallets(true) }}>Connnect Wallet</button>
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
      <PendingOrderTip visible={pendingOrderTipVisible}
        hide={() => { setPendingOrderTipVisible(false) }}
        name={name}
      />
      <Modal
        header={null}
        footer={null}
        visible={loadingPending}
        centered={true}
        className={styles['pendingOrder-modal']}
      >
        <div className={styles['pendingOrder-modal-text']}>
          <Spin size="middle" /><p>check your pendingOrder</p>
        </div>
      </Modal>
    </div>

  )
}