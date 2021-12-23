import { useEffect, useState } from "react";
import { Row, Col, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { formatAddress } from "../utils/helper";
import Copy from 'copy-to-clipboard';
import styles from '../assets/styles/Name.module.scss'
import { useAuthWallet } from "../context/AuthWallet";
import { toast } from 'react-toastify';
import { ethers } from "ethers";
import ServiceApi from "../utils/ServiceApi";
import { deleteCache } from '../utils/localCache';
import { ConnectWallets } from ".";
declare const window: any;

const renderTooltip = (arg) => (
  <Tooltip id="button-tooltip" {...arg} className={styles.toolipsss}>
    Connect to your eth wallet and check if your address is in the whitelist. If the address is in the whitelist, there will be a free 4-digit name registration quota
  </Tooltip>
);

export const NameRegister = (props) => {

  const { ...auth } = useAuthWallet();
  const [credit, setCredit] = useState(0);
  const [showWallets, setShowWallets] = useState(false);
  const [isEthConnected, setIsEthConnected] = useState<boolean>(false);
  const [ethWalletAddress, setEthWalletAddress] = useState('');
  const [loadingConnectEth, setLoadingConnectEth] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const serviceApi = new ServiceApi();

  const handleSubmitToRegisterName = async () => {
    if(loadingSubmit) return
    setLoadingSubmit(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const message = `${props.name}${auth.principal?.toText() || ""}`;
    const signature = await signer.signMessage(message);
    serviceApi.registerName(props.name, ethWalletAddress, auth.principal?.toText() || "", signature).then(regResult => {
      console.log('regResult',regResult)
      if (regResult === true) {
        toast('Register name success', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
        deleteCache(props.name + 'details')
        deleteCache(props.name + 'details')
        deleteCache('myNamesOfFavorite' + auth.walletAddress)
        deleteCache('namesOfController' + auth.walletAddress)
      } else {
        toast('Register name failed', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      }
      setLoadingSubmit(false)
    }).catch(err => {
      console.log(err)
      toast('Register name failed', {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
    })
  }

  const getCurrentEthWallet = () => {
    if (typeof window?.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
      setEthWalletAddress(window.ethereum.selectedAddress);
      setIsEthConnected(true)
    } else {
      setIsEthConnected(false)
    }
  }

  useEffect(() => {
    serviceApi.creditOfEthAddress(ethWalletAddress)
      .then(creditRes => {
        setCredit(creditRes)
      }).catch(err => {
        toast('Load your eth wallet credit failed', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethWalletAddress])

  const connectEthWallet = async () => {
    var u = navigator.userAgent;
    var isWeixin = u.toLowerCase().indexOf('micromessenger') !== -1;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios
    if (typeof window?.ethereum === 'undefined') {
      if (isWeixin) {
        toast('Please open it in your browser', {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
        return false
      }
      if (isIOS) {
        window.location.href = 'metamask://'
        return false
      } else if (isAndroid) {
        window.location.href = 'metamask://';
        return false
      } else {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn')
        return false
      }
    } else if (window.ethereum.chainId === '0x1') {
      setLoadingConnectEth(true)
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          setEthWalletAddress(accounts[0])
          setLoadingConnectEth(false)
          setIsEthConnected(true)
        })
        .catch((err) => {
          console.error(err);
          setLoadingConnectEth(false)
        });
    } else {
      toast('Please switch to ETH mainnet.', {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      setLoadingConnectEth(false)
    }
  }
  useEffect(() => {
    getCurrentEthWallet()
  }, [])
  return (
    <div className={styles.register}>
      {
        !props.available ?
          <div style={{textAlign:'center',paddingTop:'.9rem'}}>This name is already registered</div>
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
                {
                  isEthConnected && <OverlayTrigger overlay={renderTooltip}><i className="bi bi-question-circle"></i></OverlayTrigger>
                }
              </Col>
              <Col md={4} sm={12} className="text-center" >
                {/* <input value={credit} onChange={(e: any) => { setCredit(e.target.value) }} className={styles['text-input']} /> */}
                {isEthConnected ? credit : <OverlayTrigger overlay={renderTooltip}><i className="bi bi-question-circle"></i></OverlayTrigger>}
              </Col>
              <Col md={4} sm={12}>
                <div className={styles['text-right']}>
                  {
                    !isEthConnected ?
                      <button className={`${styles.btn} ${styles['btn-conect-eth']}`} onClick={connectEthWallet}>
                        {
                          loadingConnectEth && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />
                        }
                        Connnect ETH Wallet
                      </button>
                      :
                      <div className={styles['eth-address-wrap']}>
                        <p className={styles['eth-address']}> {formatAddress(ethWalletAddress)}</p>
                        <i className="bi bi-files" onClick={() => {
                          Copy(ethWalletAddress);
                          toast.success('Clipboard', {
                            position: "top-center",
                            autoClose: 2000,
                            theme: 'dark'
                          })
                        }}></i>
                      </div>
                  }
                </div>
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
                 
                  <button className={styles.btn} disabled={credit > 0 ? false : true} onClick={handleSubmitToRegisterName}>
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


