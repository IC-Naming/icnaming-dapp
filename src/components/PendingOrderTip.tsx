import React from 'react'
import { useHistory } from "react-router-dom";
import styles from '../assets/styles/Card.module.scss'
import { Modal } from "react-bootstrap";
export interface PendingOrderTipProps {
  visible: boolean,
  hide: () => void,
}
export const PendingOrderTip: React.FC<PendingOrderTipProps> = ({ visible,hide }) => {
  const history = useHistory();
  const viewOrder = () => {
    history.push(`/pay`)
  }
  return (
    <Modal
        show={visible}
        style={{ zIndex: 222222 }}
        backdrop={true}
      >
        <Modal.Header>
          <Modal.Title className="fz-18 connectwallettitle">Notice</Modal.Title>
          <button className='close' onClick={e => { e.stopPropagation();hide() }}>
            <i className="bi bi-x-circle"></i>
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className="line-light mb-3"></div>
          <div className={styles['notice-main']}>You have a pending order</div>
        </Modal.Body>
        <Modal.Footer className={styles['notice-modal-footer']}>
          <button className={styles['notice-btn']} onClick={(e) => {
            e.stopPropagation();
            viewOrder()
          }}>View</button>
        </Modal.Footer>
      </Modal>
  )
}