import React from 'react'
import { useHistory } from "react-router-dom";
import styles from '../assets/styles/Card.module.scss'
import ServiceApi from '../utils/ServiceApi'
import { useAuthWallet } from '../context/AuthWallet';
import { toast } from 'react-toastify';
import { deleteCache } from '../utils/localCache';
import { Spinner } from 'react-bootstrap';
import { useMyInfo } from '../context/MyInfo';
import { PendingOrderTip } from '.';

export interface CardProps {
  name: string,
  regTime: string,
  available: boolean,
  isMyAccount?: boolean,
  favorite: boolean,
}
export const Card: React.FC<CardProps> = ({ name, regTime, available, isMyAccount, favorite }) => {
  const { ...auth } = useAuthWallet();
  const { ...myInfo } = useMyInfo();
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const [checkOrderIng, setCheckOrderIng] = React.useState<boolean>(false)
  const [isFavorite, SetIsFavorite] = React.useState<boolean>(false)
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
    if (auth.walletAddress) {
      setCheckOrderIng(true)
      myInfo.checkPendingOrder()
      if (myInfo.hasPendingOrder) {
        setVisible(true)
      } else {
        history.push(`/name/${name}/reg`)
      }
    } else {
      history.push(`/name/${name}/reg`)
    }
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
                <button onClick={e => { e.stopPropagation(); checkOrder(); }} className={styles['btn-reg']}>
                  {checkOrderIng && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}
                  register
                </button>
              </div>
              <div className={styles.available}>Available</div>
            </>
            :
            <div className={styles.unavailable}>Unavailable</div>
      }
      <PendingOrderTip visible={visible}
        hide={() => { setVisible(false);setCheckOrderIng(false) }}
      />
    </div>
  )
}