import React from 'react'
import { useHistory } from "react-router-dom";
import { Modal } from '@douyinfe/semi-ui';
import styles from '../assets/styles/PendingOrderTip.module.scss'
export interface PendingOrderTipProps {
  visible: boolean,
  hide: () => void,
}
export const PendingOrderTip: React.FC<PendingOrderTipProps> = ({ visible, hide }) => {
  const history = useHistory();
  const viewOrder = () => {
    history.push(`/pay`)
  }
  return (
    <Modal
      visible={visible}
      maskClosable={false}
      title="Notice"
      footer={null}
      onCancel={(e)=>{
        e.stopPropagation();
        hide();
      }}
      className={styles['pendingOrder-modal']}
    >
      <div className="line-light mb-3"></div>
      <div className={styles['notice-main']}>You have a pending order</div>
      <div className={styles['notice-btn-wrap']}>
        <button className={styles['notice-btn']} onClick={(e) => {
          e.stopPropagation();
          viewOrder()
        }}>View</button>
      </div>

    </Modal>
  )
}