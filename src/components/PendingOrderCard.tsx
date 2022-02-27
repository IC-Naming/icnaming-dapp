import { useCallback } from 'react'
import { useHistory } from "react-router-dom";
import styles from '../assets/styles/Card.module.scss';
import { GetNameOrderResponse } from 'utils/canisters/registrar/interface';

export interface CardProps {
  order: GetNameOrderResponse;
  // favorite: boolean;
}

const PendingOrderCard: React.FC<CardProps> = ({ order }) => {
  const { 
    name
  } = order;
  const history = useHistory();

  const handleView = useCallback(async () => {
    history.push(`/pay`);
  }, [history]);

  return (
    <div className={`${styles["card"]}`} onClick={() => {
      history.push(`/pay`)
    }}>
      <div className={styles['card-left']}>
        {/* <div className={styles['add-favorite']} onClick={(e) => { handleFavorite(e) }}>
          <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </div> */}
        <div className={styles.name}>{name}</div>
      </div>
      <div className={styles['card-right']}>
        <button onClick={handleView} className={styles['btn-reg']}>
          View
        </button>
      </div>
      <div className={styles.available}>To be paid</div>
    </div>
  )
}

export default PendingOrderCard;