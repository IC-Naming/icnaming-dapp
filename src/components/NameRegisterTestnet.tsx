import { useEffect, useState } from "react";
import { Row, Col, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss'
import { useAuthWallet } from "../context/AuthWallet";
import { toast } from 'react-toastify';
import ServiceApi from "../utils/ServiceApi";
import { deleteCache } from '../utils/localCache';
import { ConnectWallets } from ".";

const renderTooltip = (arg) => (
  <Tooltip id="button-tooltip" {...arg} className={styles.toolipsss}>
    Each user has a test registration quota
  </Tooltip>
);

export const NameRegisterTestnet = (props) => {
  const { ...auth } = useAuthWallet();
  const [credit, setCredit] = useState(0);
  const [showWallets, setShowWallets] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [loadingCredit, setLoadingCredit] = useState<boolean>(true);
  const serviceApi = new ServiceApi();

  const toastTopcenter = (msg) => {
    toast(msg, {
      position: "top-center",
      autoClose: 2000,
      theme: "dark",
    });
  }
  const submitToregisterNameTest = async () => {
    if (loadingSubmit) return
    setLoadingSubmit(true)
    console.log('reg start')
    serviceApi.registerNameTestnet(props.name).then(regResult => {
      console.log('regResult', regResult)
      if (regResult === true) {
        toast.success('Register name success', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
        deleteCache(props.name + 'details')
        deleteCache('myNamesOfFavorite' + auth.walletAddress)
        deleteCache('namesOfController' + auth.walletAddress)
        setCredit(credit - 1)
      } else {
        toastTopcenter(regResult);
      }
      setLoadingSubmit(false)
    }).catch(err => {
      console.log(err)
      setLoadingSubmit(false)
      toastTopcenter('Testnet Register name failed');
    })
  }

  useEffect(() => {
    const ac = new AbortController();
    if (auth.isAuthWalletConnected) {
      setLoadingCredit(true)
      serviceApi.creditOfTestnet()
        .then(creditRes => {
          setCredit(creditRes)
          setLoadingCredit(false)
        }).catch(err => {
          setLoadingCredit(false)
          toastTopcenter('get creditOfTestnet Error');
        })
    } else {
      setLoadingCredit(false)
    }
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.walletAddress])

  return (
    <div className={styles.register}>
      {
        !props.available ?
          <div style={{ textAlign: 'center', paddingTop: '.9rem' }}>This name is already registered</div>
          : <>
            <Row>
              <Col md={4} sm={12}>Registration Period </Col>
              <Col md={4} sm={12} className="text-center">
                <input value="1" className={`${styles['text-input']} ${styles['disabled']}`} disabled />
              </Col>
              <Col md={4} sm={12}><p className={styles['text-right']}>Years</p></Col>
            </Row>
            <Row>
              <Col md={4} sm={12}>Registration Price</Col>
              <Col md={4} sm={12} className="text-center">0</Col>
              <Col md={4} sm={12}><p className={styles['text-right']}>ICP</p></Col>
            </Row>
            <Row>
              <Col md={4} sm={12}>Protocol Fee</Col>
              <Col md={4} sm={12} className="text-center">0</Col>
              <Col md={4} sm={12}><p className={styles['text-right']}>ICP</p></Col>
            </Row>
            <Row>
              <Col md={4} sm={12}>quota
                <OverlayTrigger overlay={renderTooltip}><i className="bi bi-question-circle"></i></OverlayTrigger>
              </Col>
              <Col md={4} sm={12} className="text-center" >
                {
                  loadingCredit ? <Spinner animation="border" size="sm" style={{ marginRight: 10 }} /> : credit
                }
              </Col>
              <Col md={4} sm={12}>

              </Col>
            </Row>
            {
              !auth.isAuthWalletConnected
                ?
                <div className="d-grid gap-2">
                  <button className={styles.btn} onClick={() => { setShowWallets(true) }}>Connnect ICP Wallet</button>
                </div>
                :
                <div className="d-grid gap-2">
                  <button
                    className={styles.btn}
                    disabled={credit > 0 ? false : true}
                    onClick={submitToregisterNameTest}>
                    {loadingSubmit && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                    Submit Request</button>
                </div>
            }
          </>
      }
      <ConnectWallets visible={showWallets} hide={() => { setShowWallets(false) }} />
    </div>
  )
}