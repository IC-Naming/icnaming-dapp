import React, { useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styles from '../assets/styles/Name.module.scss'
import { ModalTipFull } from "./ModalTipFull";
import { useMyInfo } from "../context/MyInfo";
import ServiceApi from "../utils/ServiceApi";
import { CanisterError } from "utils/exception";

export const Refund = (props) => {
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const { ...myInfo } = useMyInfo();
  const [visiableModalTipFull, setVisiableModalTipFull] = useState<boolean>(false)
  const [visiableModalTipFullText, setVisiableModalTipFullText] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const refund = async () => {
    if (loading) return
    setLoading(true)
    setVisiableModalTipFull(true)
    setVisiableModalTipFullText('Refund in progress')
    serviceApi.refundOrder().then(res => {
      if (res) {
        toast.success('Refund success', {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark'
        })
        myInfo.cleanPendingOrder()
      }
      setVisiableModalTipFull(false)
    }).catch(err => {
      setVisiableModalTipFull(false)
      if (err instanceof CanisterError) {
        toast.error(err.message, {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark'
        })
      }
    }).finally(() => {
      setLoading(false);
      history.push('/');
    })
  }

  return (
    <>
      <Row>
        <Col md={12} sm={12}>
          <p className="text-center">Unfortunately, the name is registered by someone else</p>
        </Col>
      </Row>
      <div className="d-grid gap-2">
        <button className={styles.btn} onClick={() => { refund() }}>
          {loading && <Spinner animation="border" size="sm" style={{marginRight:10}} />}
          Refund
        </button>
      </div>
      <ModalTipFull visible={visiableModalTipFull} text={visiableModalTipFullText} />
    </>
  )
}