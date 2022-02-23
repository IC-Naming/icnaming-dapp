import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Principal } from "@dfinity/principal";
import { Row, Col, Spinner } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss'
import { useAuthWallet } from "../context/AuthWallet";
import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";
// import { deleteCache } from '../utils/localCache';
import { ConnectWallets } from ".";
import { Select, Badge, Avatar } from '@douyinfe/semi-ui';
const Option = Select.Option;

interface RegProps {
  regname: string;
  available: boolean;
}
export const Register: React.FC<RegProps> = ({ regname, available }) => {
  const history = useHistory();
  const { ...auth } = useAuthWallet();
  const [quotas, setQuotas] = useState<any>([]);
  const [showWallets, setShowWallets] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [loadingQuotas, setLoadingQuotas] = useState<boolean>(false);

  const [calculating, setCalculating] = useState<boolean>(true);
  const [price, SetPrice] = useState(0)
  const [cyclesPrice, SetCyclesPrice] = useState(0)

  const [payQuota, setPayQuota] = useState(7)

  const serviceApi = new ServiceApi();

  const toastTopcenter = (msg) => {
    toast(msg, {
      position: "top-center",
      autoClose: 2000,
      theme: "dark",
    });
  }

  const registerVidIcp = async () => {
    if (loadingSubmit) return
    setLoadingSubmit(true)
    // serviceApi.submitRegisterOrder
  }

  const registerVidQuota = async () => {
    if (loadingSubmit) return
    setLoadingSubmit(true)
    serviceApi.registerNameByQuota(regname, payQuota).then(res => {
      console.log(res)

    }).catch(err => {
      setLoadingSubmit(false)
      toastTopcenter(err.message)
    })
  }

  useEffect(() => {
    const namePrice = [
      3.54,
      3.22,
      2.93,
      2.66,
      2.42,
      2.2,
      2
    ]
    let priceLev = 0;
    if (regname.split('.')[0].length >= 7) {
      SetCyclesPrice(2)
      priceLev = 2
    } else {
      priceLev = namePrice[regname.split('.')[0].length - 1]
      SetCyclesPrice(priceLev)
    }
    serviceApi.getIcpToCyclesRate().then(res => {
      console.log('getIcpToCyclesRate', res)
      SetPrice(priceLev / 10)
      setCalculating(false)
    }).catch(err => {
      setCalculating(false)
      SetPrice(priceLev / 10)
      console.log(err)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regname])

  /* useEffect(() => {
    const ac = new AbortController();
    const checkMyQutas = async () => {
      setLoadingQuotas(true)
      if (auth.walletAddress && auth.principal) {
        const get_MyQuotas = async (user: Principal) => {
          const quota4 = await serviceApi.getQuota(user, 4);
          const quota5 = await serviceApi.getQuota(user, 5);
          const quota6 = await serviceApi.getQuota(user, 6);
          const quota7 = await serviceApi.getQuota(user, 7);
          return [quota4, quota5, quota6, quota7]
        }
        const res = Promise.all(await get_MyQuotas(auth.principal));
        console.log(res)
        setQuotas(res)
        setLoadingQuotas(false)
      } else {
        setLoadingQuotas(false)
      }
    }
    checkMyQutas()
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.walletAddress]) */

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
            <Row style={{ marginBottom: '1rem' }}>
              <Col md={4} sm={12}>Registration Price</Col>
              <Col md={4} sm={12} className="text-center">
                <div style={{ whiteSpace: 'nowrap' }}>
                  {
                    calculating
                      ?
                      <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />
                      : price
                  }
                  &nbsp;ICP ≈ {cyclesPrice}T Cycles / Year
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
                  <>
                    <Row className="mb-3">
                      <Col md={12} sm={12}>
                        <button
                          className={styles.btn}
                          style={{ margin: 'auto', display: 'block' }}
                          onClick={registerVidIcp}>
                          {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                          Register via ICP</button>
                      </Col>
                    </Row>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ marginRight: 10 }}>
                        <button
                          className={styles.btn}
                          // disabled={quota > 0 ? false : true}
                          onClick={() => {
                            registerVidQuota()
                            history.push(`/pay/${regname}`)
                          }}>
                          {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                          Register via Quota</button>
                      </div>

                      <div>
                        <Select size='large' className={styles['selcet-quota']} placeholder="please choose you quota">
                          <Option>please choose you quota</Option>
                          <Option className={styles['quota-option']}>
                            <div className={styles['quota-option-con']}>
                              <Badge count={7} className={styles['quota-option-badge']}>
                                <Avatar shape='square' className={styles['quota-option-avatar']}>Quota</Avatar>
                              </Badge>
                              <span className={styles['quota-num']}>9</span>
                            </div>
                            <Badge count='recommend' className={styles.recommend} />
                          </Option>
                          <Option className={styles['quota-option']}>
                            <div className={styles['quota-option-con']}>
                              <Badge count={6} className={styles['quota-option-badge']}>
                                <Avatar shape='square' className={styles['quota-option-avatar']}>Quota</Avatar>
                              </Badge>
                              <span className={styles['quota-num']}>5</span>
                            </div>
                          </Option>
                          <Option className={styles['quota-option']}>
                            <div className={styles['quota-option-con']}>
                              <Badge count={5} className={styles['quota-option-badge']}>
                                <Avatar shape='square' className={styles['quota-option-avatar']}>Quota</Avatar>
                              </Badge>
                              <span className={styles['quota-num']}>3</span>
                            </div>
                          </Option>
                          <Option className={styles['quota-option']}>
                            <div className={styles['quota-option-con']}>
                              <Badge count={4} className={styles['quota-option-badge']}>
                                <Avatar shape='square' className={styles['quota-option-avatar']}>Quota</Avatar>
                              </Badge>
                              <span className={styles['quota-num']}>1</span>
                            </div>
                          </Option>
                          {/* {
                            quotas.map((quota, index) => {
                              return <Option value={quota} key={index}>Quota{index}:{quota}</Option>
                            })
                          } */}
                        </Select>
                      </div>
                    </div>
                    <div>

                    </div>
                  </>
            }
          </>
      }
      <ConnectWallets visible={showWallets} hide={() => { setShowWallets(false) }} />
    </div>
  )
}