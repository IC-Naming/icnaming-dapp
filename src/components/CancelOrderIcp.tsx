import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import styles from '../assets/styles/Name.module.scss'
import payStyles from '../assets/styles/Pay.module.scss'
import { ModalTipFull } from "./ModalTipFull";
import { useMyInfo } from "../context/MyInfo";
import serviceApi from "../utils/ServiceApi";
import { CanisterError } from "utils/exception";
import { Modal } from "@douyinfe/semi-ui";
import toast from "@douyinfe/semi-ui/lib/es/toast";
interface CancelOrderIcpProps {
  name: string;
}
export const CancelOrderIcp: React.FC<CancelOrderIcpProps> = ({ name }) => {
  const history = useHistory();
  const { ...myInfo } = useMyInfo();
  const [loading, setLoading] = useState<boolean>(false)
  const [visiableModalTipFull, setVisiableModalTipFull] = useState<boolean>(false)

  const cancelRegisterOrder = async () => {
    if (loading) return
    setLoading(true)
    setVisiableModalTipFull(true)
    ;(await serviceApi).cancelRegisterOrder().then(res => {
      if (res) {
        setLoading(false)
        setVisiableModalTipFull(false)
        toast.success('Order cancelled success')
        myInfo.cleanPendingOrder();
        localStorage.removeItem('orderInfo');
        history.push(`/search/${name.split('.')[0]}`);
      }
    }).catch(err => {
      if (err instanceof CanisterError) {
        setLoading(false)
        setVisiableModalTipFull(false)
        toast.error(err.message)
      }
      console.log('cancelRegisterOrder', err)
    })
  }

  const cancelConfirm = async () => {
    Modal.warning({
      'title': 'Warning: cancellation of order',
      'content': 'Please do not cancel order if you have already paid, do you want to cancel the order indeed?',
      'onOk': cancelRegisterOrder,
      'maskClosable': false,
      'okText': 'Yes',
      'cancelText': 'No',
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