import React from 'react'
import { useHistory } from "react-router-dom";
import styles from '../assets/styles/Card.module.scss'
import ServiceApi from '../utils/ServiceApi'
import { useAuthWallet } from '../context/AuthWallet';
import { toast } from 'react-toastify';
import { deleteCache } from '../utils/localCache';
import { Modal, Spinner } from "react-bootstrap";

export interface CardProps {
  name: string,
  regTime: string,
  available: boolean,
  isMyAccount?: boolean,
  favorite: boolean,
}
export const Card: React.FC<CardProps> = ({ name, regTime, available, isMyAccount, favorite }) => {
  const { ...auth } = useAuthWallet();
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const [isFavorite, SetIsFavorite] = React.useState<boolean>(false)
  const [checkOrderIng, setCheckOrderIng] = React.useState<boolean>(false)
  const [visible, setVisible] = React.useState<boolean>(false)

  React.useEffect(() => {
    SetIsFavorite(favorite)
  }, [favorite])

  const changeLocalFavorite = async (name) => {
    let myFavoriteNames = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]')
    if (isFavorite) {
      myFavoriteNames = myFavoriteNames.filter(item => item !== name)
    } else {
      myFavoriteNames.push(name)
    }
    localStorage.setItem('myFavoriteNames', JSON.stringify(myFavoriteNames))
  }

  const addFavorite = (e) => {
    SetIsFavorite(!isFavorite)
    changeLocalFavorite(name)
    serviceApi.addFavoriteName(name).then(res => {
      if (res) {
        console.log('clear cache of myNamesOfFavorite & myFavoriteNamesWithExpireAt')
        deleteCache('favoriteall' + auth.walletAddress)
        deleteCache('myNamesOfFavorite' + auth.walletAddress);
        console.log("addFavorite", res)
      }
    })
  }

  const removeFavorite = (e) => {
    SetIsFavorite(!isFavorite)
    changeLocalFavorite(name)
    serviceApi.removeFavoriteName(name).then(res => {
      if (res) {
        console.log('clear cache of myNamesOfFavorite & myFavoriteNamesWithExpireAt')
        deleteCache('favoriteall' + auth.walletAddress)
        deleteCache('myNamesOfFavorite' + auth.walletAddress);
        console.log("removeFavorite", res)
      }
    })
  }

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (auth.isAuthWalletConnected) {
      if (isFavorite) {
        removeFavorite(e)
      } else {
        addFavorite(e)
      }
    } else {
      toast.warning('Wallet is not connected', {
        position: "top-center",
        autoClose: 2000,
        theme: 'dark'
      })
    }
  }

  const checkOrder = () => {
    setCheckOrderIng(true)
      serviceApi.getPendingOrder().then(res => {
        setCheckOrderIng(false)
        if (res.length !== 0) {
          setVisible(true)
        } else {
          history.push(`/name/${name}/reg`)
        }
      }).catch(err => {
        console.log(err)
      })
  }

  return (
    <div className={`${styles["card"]}`} onClick={() => {
      history.push(`/name/${name}/details`)
    }}>
      <div className={styles['card-left']}>
        <div className={styles['add-favorite']} onClick={(e) => { handleFavorite(e) }}>
          <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </div>
        <div className={styles.name}>{name}</div>
        <div className={styles.time}>{regTime}</div>
      </div>
      {
        isMyAccount ? null
          :
          available ?
            <>
              <div className={styles['card-right']}>
                <button onClick={e => { e.stopPropagation(); checkOrder() }} className={styles['btn-reg']}>
                  {checkOrderIng && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                  register
                </button>
              </div>
              <div className={styles.available}>Available</div>
            </>
            :
            <div className={styles.unavailable}>Unavailable</div>
      }

      <Modal
        show={visible}
        style={{ zIndex: 222222 }}
        backdrop={true}
      >
        <Modal.Header>
          <Modal.Title className="fz-18 connectwallettitle">Notice</Modal.Title>
          <button className='close' onClick={e => { e.stopPropagation(); setVisible(false) }}>
            <i className="bi bi-x-circle"></i>
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className="line-light mb-3"></div>
          <div className={styles['notice-main']}>You have a pending order</div>
        </Modal.Body>
        <Modal.Footer className={styles['notice-modal-footer']}>
          <button className={styles['notice-btn']} onClick={(e) => {
            e.stopPropagation(); setVisible(false)
          }}>Don`t show again</button>
          <button className={styles['notice-btn']} onClick={(e) => {
            e.stopPropagation();
            history.push(`/name/${name}/reg`)
          }}>View</button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}