import { useEffect, useState } from 'react'
import { Card, CopyToClipboard } from "../components";
import styles from '../assets/styles/Search.module.scss'
import { Container } from 'react-bootstrap';
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from '../utils/ServiceApi';
import dateFormat from "dateformat";
export const Favourites = () => {
  const { ...authWallet } = useAuthWallet();
  const serviceApi = new ServiceApi();
  const [loading, setLoading] = useState<boolean>(true)
  const [nameResult, setNameResult] = useState<any>();
  useEffect(() => {
    setLoading(true)
    const getMyFavoriteNames = async () => {
      if (authWallet.walletAddress) {
        let myFavoriteNames;
        if (localStorage.getItem('myFavoriteNames')) {
          myFavoriteNames = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]')
        } else {
          myFavoriteNames = await serviceApi.getFavoriteNames();
          localStorage.setItem('myFavoriteNames', JSON.stringify(myFavoriteNames));
        }

        const myFavoriteNamesWithExpireAt = myFavoriteNames.map(async (item: any) => {
          const available = await serviceApi.available(item);
          const expireAtOfName = await serviceApi.expireAtOf(item);
          const isMyAccount = await serviceApi.getRegistrantOfName(item) || false;
          return {
            name: item,
            available: available,
            isMyAccount: isMyAccount.toText() === authWallet.principal?.toText() ? true : false,
            expireAt: expireAtOfName > 0 ? 'Expires ' + dateFormat(new Date(expireAtOfName), "isoDateTime") : ''
          }
        })
        Promise.all(myFavoriteNamesWithExpireAt).then(res => {
          setNameResult(res)
          setLoading(false)
        })
      }
    }
    getMyFavoriteNames()
  }, [authWallet.walletAddress])// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.serach}>
      <div className="container pt-5">
        <div className={styles['serach-content']}>
          <Container className={`pt-5`}>
            {
              loading ?
                <div className="text-center"><div className="spinner-border text-primary" role="status"></div></div>
                :
                <>
                  <div className={styles['search-address']}>
                    <span className={styles.icon}><i className="bi bi-person"></i></span>
                    <span className={styles.address}>{authWallet.walletAddress}</span>
                    <CopyToClipboard text={authWallet.walletAddress} />
                  </div>
                  <div className={styles['search-result']}>
                    {
                      nameResult && nameResult.length > 0 ?
                        <div className={styles.list}>
                          {
                            nameResult?.map((item, index) => {
                              return <Card key={index}
                                name={item?.name}
                                regTime={item?.expireAt}
                                available={item?.available}
                                isMyAccount={item?.isMyAccount}
                                favorite={true} />
                            })
                          }
                        </div>
                        :
                        <div className="nodata"><span>No search results</span></div>
                    }
                  </div>
                </>
            }
          </Container>
        </div>
      </div>
    </div >
  )
}

