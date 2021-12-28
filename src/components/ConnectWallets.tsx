import React from "react";
import logoipc from '../assets/images/icplogo.png';
import plugimg from '../assets/images/pluglogo.png';
import walletimg from '../assets/images/walletlogo.png';
import maskimg from '../assets/images/masklogo.png';
import styles from "../assets/styles/ConnectWallets.module.scss";
import { Row, Col, Modal } from "react-bootstrap";
import { useAuthWallet } from "../context/AuthWallet";
import { ToastContainer, toast } from 'react-toastify';
interface propsType {
  visible: boolean;
  hide: () => void;
}
export const ConnectWallets: React.FC<propsType> = ({ visible, hide }) => {

  const { ...authWallet } = useAuthWallet()

  const connPlugWallet = () => {
    authWallet.connectPlugWallet().then(async (res: any) => {
      if (res && res.connected) {
        hide()
      } else {
        toast.error('fail connect', {
          position: "top-center"
        })
      }
    }).catch(error => {
      console.log(error)
      toast.error('fail connect', {
        position: "top-center"
      })
    });
  }

  const connectIIWallet = ()=>{
    authWallet.connectII().then((res: any)=>{
      console.log(res)
      if(res && res.connected){
        hide()
      }else{
        toast.error('fail connect', {
          position: "top-center"
        })
      }
    })
  }

  const showMessage = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 2000,
      theme: 'dark'
    })
  }
  return (
    <Modal
      show={visible}
      onHide={hide}
      style={{zIndex:1111}}
    >
      <Modal.Header>
        <Modal.Title className="fz-18 connectwallettitle">Select a Wallet</Modal.Title>
        <button className='close' onClick={hide}>
        <i className="bi bi-x-circle"></i>
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className="line-light mb-3"></div>
        <p className="mb-4 modal-text-color">Please select a wallet to connect to this dapp:</p>
        <Row>
          <Col sm="6">
            <button className={styles["btn-connect"]} onClick={connectIIWallet}>
              <img src={logoipc} alt="ipc" />
              <span>Internet Identity</span>
            </button>
          </Col>
          <Col sm="6">
            <button className={styles["btn-connect"]} onClick={connPlugWallet}>
              <img src={plugimg} alt="plug" />
              <span>Plug</span>
            </button>
          </Col>
          <Col sm="6">
            <button className={styles["btn-connect"]} onClick={() => { showMessage('After the support') }}>
              <img src={maskimg} alt="MetaMask" />
              <span>MetaMask</span>
            </button>
          </Col>
          <Col sm="6">
            <button className={styles["btn-connect"]} onClick={() => { showMessage('After the support') }}>
              <img src={walletimg} alt="Wallet Connect" />
              <span>Wallet Connect</span>
            </button>
          </Col>
        </Row>
        <ToastContainer />
      </Modal.Body>
    </Modal>
  );
};