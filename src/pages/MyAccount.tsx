import React, { useEffect, useState } from 'react'
import { SearchInput, Card, CopyToClipboard } from "../components";
import { Principal } from '@dfinity/principal';
import styles from '../assets/styles/Search.module.scss'
import { Container, Tab, Tabs } from 'react-bootstrap';
import ServiceApi from '../utils/ServiceApi';
import { useAuthWallet } from '../context/AuthWallet';
import dateFormat from "dateformat";
import { queryWithCache } from '../utils/localCache';
import { Skeleton, Pagination, List } from '@douyinfe/semi-ui';
import { useAnalytics } from '../utils/GoogleGA';
export const MyAccount = () => {
  useAnalytics('MyAccount');
  const { ...authWallet } = useAuthWallet();
  const serviceApi = new ServiceApi();
  const [loading, setLoading] = useState<boolean>(true)
  const [namesOfRegistrant, setNamesOfRegistrant] = useState<any>();
  const [namesOfController, setNamesOfController] = useState<any>();
  const [pageReg, onPageRegChange] = useState<number>(1);
  const [pageCtrl, onPageCtrlChange] = useState<number>(1);
  let pageSize = 5;

  const getMyFavourites = async () => {
    let myFavoriteNamesStorage = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
    if (myFavoriteNamesStorage && myFavoriteNamesStorage.length > 0) {
      return myFavoriteNamesStorage;
    } else {
      return await queryWithCache(async () => {
        const favoriteNamesSevice = await serviceApi.getFavoriteNames()
        localStorage.setItem('myFavoriteNames', JSON.stringify(favoriteNamesSevice))
        return serviceApi.getFavoriteNames();
      }, 'myNamesOfFavorite' + authWallet.walletAddress);
    }
  }

  useEffect(() => {

    if (authWallet.walletAddress) {
      const wordParam: Principal = Principal.fromText(authWallet.walletAddress);
      let getNamesOfRegistrantLoaded = false;
      let getNamesOfControllerLoaded = false;

      queryWithCache(() => {
        return new Promise((resolve, reject) => {
          serviceApi.getNamesOfRegistrant(wordParam).then(data => {
            resolve(data)
          }).catch(errs => {
            reject(errs)
          });
        })
      }, 'getNamesOfRegistrant' + authWallet.walletAddress, 60).then(async (res) => {
        // for each res ,map it to NameModel
        let myNamesOfFavorite = await getMyFavourites()
        let namesOfRegistrant = res.sort((a, b) => {
          return a.expired_at > b.expired_at ? -1 : 1
        }).map(item => {
          return {
            name: item.name,
            expireAt: 'Expires ' + dateFormat(new Date(Number(item.expired_at)), "isoDateTime"),
            favorite: myNamesOfFavorite.includes(item.name),
            avaiable: false
          }
        })

        setNamesOfRegistrant(namesOfRegistrant)
        getNamesOfRegistrantLoaded = true;
        if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded)
          setLoading(false)
      }).catch(err => {
        console.log(err)
        setLoading(false)
      });

      queryWithCache(() => {
        return new Promise((resolve, reject) => {
          serviceApi.getNamesOfController(wordParam).then(data => {
            resolve(data)
          }).catch(errs => {
            reject(errs)
          });
        })
      }, 'namesOfController' + authWallet.walletAddress).then(async (res) => {
        // console.log("my address result of controller", res)
        // for each res ,map it to NameModel
        let myNamesOfFavorite = await getMyFavourites()
        const names = res.map(n => {
          let fav = myNamesOfFavorite.find(item => item === n);
          return { name: n, avaiable: false, expireAt: "", favorite: fav }
        })
        setNamesOfController(names)
        getNamesOfControllerLoaded = true;
        if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded)
          setLoading(false)
      }).catch(err => {
        console.log(err)
        setLoading(false)
      })
      return () => {
        setLoading(true)
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authWallet.walletAddress])


  const getData = (page: number) => {
    let start = (page - 1) * pageSize;
    let end = page * pageSize;
    return namesOfRegistrant.slice(start, end);
  }

  const myAccountId = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', width: '80%', marginBottom: '2rem' }}>
        <Skeleton.Avatar style={{ width: 70, height: 60, marginRight: '1rem' }} />
        <Skeleton.Title style={{ width: '100%', height: 32 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <Skeleton.Button style={{ marginRight: 5 }} />
        <Skeleton.Button />
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
          <SearchInput />
          <Container className={`pt-5`}>
            <div className={styles['search-address']}>
              <Skeleton placeholder={myAccountId} loading={loading} style={{ width: '100%' }} active>
                <span className={styles.icon}><i className="bi bi-person"></i></span>
                <span className={styles.address}>{authWallet.walletAddress}</span>
                <CopyToClipboard text={authWallet.walletAddress} />
              </Skeleton>
            </div>
            {
              loading ? null :
                <div className={styles['search-result']}>

                  <Tabs defaultActiveKey="registrant" className="mb-3">
                    <Tab eventKey="registrant" title="Registrant">
                      <List
                        dataSource={getData(pageReg)}
                        split={false}
                        className={styles.list}
                        renderItem={item =>
                          <Card key={item.name} name={item.name} expireAt={item.expireAt} available={false} isMyAccount={true} favorite={item.favorite} />
                        }
                      />
                      {
                        namesOfRegistrant.length > 0 && <Pagination className='ic-pagination' pageSize={pageSize} currentPage={pageReg} total={namesOfRegistrant.length} onChange={cPage => onPageRegChange(cPage)}></Pagination>
                      }
                    </Tab>
                    <Tab eventKey="controller" title="Controller">
                      <List
                        dataSource={getData(pageCtrl)}
                        split={false}
                        className={styles.list}
                        renderItem={item =>
                          <Card name={item.name} expireAt="" available={false} isMyAccount={true} favorite={item.favorite} />
                        }
                      />
                      {
                        namesOfController.length > 0 && <Pagination className='ic-pagination' pageSize={pageSize} currentPage={pageCtrl} total={namesOfRegistrant.length} onChange={cPage => onPageCtrlChange(cPage)}></Pagination>
                      }
                    </Tab>
                  </Tabs>
                </div>
            }

          </Container>
        </div>
      </div>
    </div >
  )
}