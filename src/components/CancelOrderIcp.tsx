import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styles from '../assets/styles/Name.module.scss'
import payStyles from '../assets/styles/Pay.module.scss'
import { ModalTipFull } from "./ModalTipFull";
import { useMyInfo } from "../context/MyInfo";
import ServiceApi from "../utils/ServiceApi";
import { CanisterError } from "utils/exception";
import { Modal } from "@douyinfe/semi-ui";
interface CancelOrderIcpProps {
  name: string;
}
export const CancelOrderIcp: React.FC<CancelOrderIcpProps> = ({ name }) => {
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const { ...myInfo } = useMyInfo();
  const [loading, setLoading] = useState<boolean>(false)
  const [visiableModalTipFull, setVisiableModalTipFull] = useState<boolean>(false)

  const cancelRegisterOrder = async () => {
    if (loading) return
    setLoading(true)
    setVisiableModalTipFull(true)
    serviceApi.cancelRegisterOrder().then(res => {
      if (res) {
        setLoading(false)
        setVisiableModalTipFull(false)
        toast.success('Order cancelled success', {
          position: 'top-center',
          autoClose: 1000,
          theme: 'dark'
        })
        myInfo.cleanPendingOrder();
        localStorage.removeItem('orderInfo');
        history.push(`/search/${name.split('.')[0]}`);
      }
    }).catch(err => {
      if (err instanceof CanisterError) {
        setLoading(false)
        setVisiableModalTipFull(false)
        toast.error(err.message, {
          position: 'top-center',
          theme: 'dark'
        })
      }
      console.log('cancelRegisterOrder', err)
    })
  }

  const cancelConfirm = async () => {
    Modal.warning({
      'title': 'Warning: cancellation of order',
      'content': 'If this order has already been paid, please do not cancel',
      'onOk': cancelRegisterOrder,
      'maskClosable': false,
      'okText': 'Confirm',
      'cancelText': 'Cancel',
      'className': `${payStyles['modal-warning-cancel']}`
    });
  }

  return (
    <>
      <button className={`${styles.btn} ${payStyles['btn-pay-cancel']}`} onClick={() => {
        cancelConfirm()
      }} style={{ marginRight: 10 }}>
        {loading && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
        Cancel
      </button>
      <ModalTipFull visible={visiableModalTipFull} text='Order is cancelling' />
    </>
  )
}