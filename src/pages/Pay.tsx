import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss'
// import { useAuthWallet } from "../context/AuthWallet";
// import { toast } from 'react-toastify';
/* import ServiceApi from "../utils/ServiceApi";
interface PayPorps {
  name: string,
  available: boolean
} */
export const Pay = (props) => {
  // const { ...auth } = useAuthWallet();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  // const serviceApi = new ServiceApi();
  useEffect(() => {
    console.log(props.match.params.name)
    setLoadingSubmit(false)
  }, [props.match.params.name])


  return (
    <div className={styles['name-wrap']}>
      <div className="container pt-5">
        <div className={styles['name-content']}>
          <div className={styles.register}>
            <Row>
              <Col md={4} sm={12}>Registration Period </Col>
              <Col md={4} sm={12} className="text-center">
                1Years
              </Col>
              <Col md={4} sm={12}></Col>
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

            <div className="d-grid gap-2">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className={styles.btn} onClick={() => { }} style={{ marginRight: 10 }}>Cancel</button>
                <button className={styles.btn} onClick={() => { }}>
                  {loadingSubmit && <Spinner animation="border" size="sm" />}
                  Pay
                </button>
              </div>
            </div>

            <Row>
              <Col md={12} sm={12}>
                <p className="text-center">Unfortunately,name is registered by someone else</p>
              </Col>
            </Row>
            <div className="d-grid gap-2">
              <button className={styles.btn} onClick={() => { }}>
                {loadingSubmit && <Spinner animation="border" size="sm" />}
                Refund
              </button>
            </div>

            <div className="d-grid gap-2">
              <button className={styles.btn} onClick={() => { }}>
                {loadingSubmit && <Spinner animation="border" size="sm" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}