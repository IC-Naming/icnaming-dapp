import React, { useEffect, useState } from 'react'
import { Card, CopyToClipboard } from "../components";
import styles from '../assets/styles/Search.module.scss'
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from '../utils/ServiceApi';
import dateFormat from "dateformat";
import { queryWithCache } from '../utils/localCache';
import { Container } from 'react-bootstrap';
import { CanisterError } from '../utils/exception';
import { Skeleton } from '@douyinfe/semi-ui';

export const Favourites = () => {
  const { ...authWallet } = useAuthWallet();
  const serviceApi = new ServiceApi();
  const [loading, setLoading] = useState<boolean>(true)
  const [nameResult, setNameResult] = useState<any>();

  const getMyFavourites = async () => {
    let myFavoriteNamesStorage = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
    if (myFavoriteNamesStorage && myFavoriteNamesStorage.length > 0) {
      return myFavoriteNamesStorage;
    } else {
      console.log('origin serivce api');
      return await queryWithCache(async () => {
        const favoriteNamesSevice = await serviceApi.getFavoriteNames()
        localStorage.setItem('myFavoriteNames', JSON.stringify(favoriteNamesSevice))
        return serviceApi.getFavoriteNames();
      }, 'myNamesOfFavorite' + authWallet.walletAddress);
    }
  }

  useEffect(() => {
    setLoading(true)
    const getMyFavoriteNames = async () => {
      if (authWallet.walletAddress) {
        let myNamesOfFavorite = await getMyFavourites()
        const myFavoriteNamesWithExpireAt = myNamesOfFavorite.map(async (item: string) => {
          const isMyAccount = await serviceApi.getRegistrantOfName(item) || false;
          const available = await serviceApi.available(item).catch(err => {
            if (err instanceof CanisterError) return false;
          });
          const expireAtOfName = !available ? await serviceApi.expireAtOf(item) : 0;
          return {
            name: item,
            available: available,
            isMyAccount: isMyAccount.toText() === authWallet.principal?.toText() ? true : false,
            expireAt: expireAtOfName > 0 ? 'Expires ' + dateFormat(new Date(expireAtOfName), "isoDateTime") : ''
          }
        })
        /* const res = await Promise.all(myFavoriteNamesWithExpireAt)
        setNameResult(res)
        setLoading(false) */
        queryWithCache(async () => {
          return await Promise.all(myFavoriteNamesWithExpireAt);
        }, 'favoriteall' + authWallet.walletAddress).then(res => {
          setNameResult(res)
          setLoading(false)
        }).catch(err => {
          console.log(err)
          setLoading(false)
        });
      }
    }
    getMyFavoriteNames()
    return () => {
      setLoading(false);
      setNameResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authWallet.walletAddress])

  const favList = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', width: '80%', marginBottom: '2rem' }}>
        <Skeleton.Avatar style={{ width: 70, height: 60, marginRight: '1rem' }} />
        <Skeleton.Title style={{ width: '100%', height: 32 }} />
      </div>
      <div className={styles['skeleton-pargraph']}>
        <Skeleton.Paragraph rows={3} />
      </div>
    </>
  );
  return (
    <div className={styles.serach}>
      <div className="container pt-5">
        <div className={styles['serach-content']}>
          <Container className={`pt-5`}>
            <div className={styles['search-address']}>
              <Skeleton placeholder={favList} loading={loading} style={{ width: '100%' }} active>
                <span className={styles.icon}><i className="bi bi-person"></i></span>
                <span className={styles.address}>{authWallet.walletAddress}</span>
                <CopyToClipboard text={authWallet.walletAddress} />
              </Skeleton>
            </div>
            {
              !loading &&
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
                    <div className="nodata" style={{ background: 'none' }}><span>No data</span></div>
                }
              </div>

            }
          </Container>
        </div>
      </div>
    </div >
  )
}