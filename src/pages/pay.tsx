import { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss';
import { useAuthWallet } from "../context/AuthWallet";
import { toast } from 'react-toastify';
// import ServiceApi from "../utils/ServiceApi";

export const Pay = (props) => {
  const { ...auth } = useAuthWallet();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  // const serviceApi = new ServiceApi();

  const toastTopcenter = (msg) => {
    toast(msg, {
      position: "top-center",
      autoClose: 2000,
      theme: "dark",
    });
  }

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
              <Col md={4} sm={12}>Registration to Price</Col>
              <Col md={4} sm={12} className="text-center">0 ICP ≈ 2T Cycles</Col>
              <Col md={4} sm={12}></Col>
            </Row>

            <Row>
              <Col md={4} sm={12}>Registration to pay</Col>
              <Col md={4} sm={12} className="text-center" >
                1 Quota<span className="superscript">7</span> <span>(you have 3 Quota<span className="superscript">7</span>)</span>
              </Col>
              <Col md={4} sm={12}></Col>
            </Row>
            <Row>
              <Col md={12} sm={12}>
                <p className="text-center">Unfortunately,name is registered by someone else</p>
              </Col>
            </Row>
            <div className="d-grid gap-2">
              <button className={styles.btn} onClick={() => { }}>Cancel</button>
              <button className={styles.btn} onClick={() => { }}>
                {loadingSubmit && <Spinner animation="border" size="sm" />}
                Pay
              </button>
              <button className={styles.btn} onClick={() => { }}>
                {loadingSubmit && <Spinner animation="border" size="sm" />}
                Refund
              </button>
              <button className={styles.btn} onClick={() => { }}>
                {loadingSubmit && <Spinner animation="border" size="sm" />}
                Submit
              </button>
            </div>
          </>
      }
    </div>
  )
}