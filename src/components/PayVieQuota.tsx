import React, { useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import styles from '../assets/styles/Name.module.scss'
import { ModalTipFull } from "../components/ModalTipFull";
import { useMyInfo } from "../context/MyInfo";
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from "../utils/ServiceApi";
import { deleteCache } from "../utils/localCache";
import { CanisterError } from "utils/exception";
import toast from "@douyinfe/semi-ui/lib/es/toast";
interface QuotaTypeProps {
  quotaType: number;
  quotaTypeCount: number;
}

export const PayVieQuota: React.FC<QuotaTypeProps> = ({ quotaType, quotaTypeCount }) => {
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const { ...myInfo } = useMyInfo();
  const { ...auth } = useAuthWallet();

  const [loading, setLoading] = useState<boolean>(false)
  const [visiableModalTipFull, setVisiableModalTipFull] = useState<boolean>(false)
  const [visiableModalTipFullText, setVisiableModalTipFullText] = useState<string>('')

  const payVidQuota = async () => {
    if (loading) return
    setLoading(true)
    setVisiableModalTipFull(true)
    setVisiableModalTipFullText('Payment in progress')

    serviceApi.registerNameByQuota(myInfo.orderInfo.name, quotaType).then(res => {
      if (res === true) {
        toast.success(`Congratulations! Now you are the owner of ${myInfo.orderInfo.name}!`)
        setLoading(false)
        setVisiableModalTipFull(false)
        myInfo.getMyQuotas();
        history.push('/myaccount')
        deleteCache('getNamesOfRegistrant' + auth.walletAddress)
        deleteCache('namesOfController' + auth.walletAddress)
      } else {
        toast.error('fail register')
      }
    }).catch(err => {
      setLoading(false)
      setVisiableModalTipFull(false)
      if (err instanceof CanisterError) {
        toast.error(err.message)
      }
    })
  }

  return (
    <>
      <Row>
        <Col md={4} sm={12}>Registration to pay</Col>
        <Col md={4} sm={12} className="text-center" >
          <div style={{ whiteSpace: 'nowrap' }}>
            {myInfo.orderInfo.payYears} Quota<span className={styles['superscript']}>{quotaType}</span>
            <span style={{ color: '#999', paddingLeft: 10 }}> ( you have {quotaTypeCount} Quota<span className={styles['superscript']}>{quotaType}</span> )</span>
          </div>
        </Col>
        <Col md={4} sm={12}></Col>
      </Row>
      <div className="d-grid gap-2">
        <button className={styles.btn} onClick={() => { payVidQuota() }}>
          {loading && <Spinner animation="border" size="sm" />}
          Submit
        </button>
      </div>
      <ModalTipFull visible={visiableModalTipFull} text={visiableModalTipFullText} />
    </>
  )
}