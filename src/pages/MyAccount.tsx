import { useEffect, useState } from 'react'
import { SearchInput, Card, CopyToClipboard } from "../components";
import { Principal } from '@dfinity/principal';
import styles from '../assets/styles/Search.module.scss'
import { Container, Tab, Tabs } from 'react-bootstrap';
import ServiceApi from '../utils/ServiceApi';
import { useAuthWallet } from '../context/AuthWallet';
import dateFormat from "dateformat";
import { queryWithCache } from '../utils/localCache';

export const MyAccount = () => {
  const { ...authWallet } = useAuthWallet();
  const serviceApi = new ServiceApi();
  const [loading, setLoading] = useState<boolean>(true)
  const [namesOfRegistrant, setNamesOfRegistrant] = useState<any>();
  const [namesOfController, setNamesOfController] = useState<any>();
  
  const getMyFavourites = async () => {
    return await queryWithCache(async () => {
      return await serviceApi.getFavoriteNames()
    }, 'myNamesOfFavorite')
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
            console.log(errs)
            reject(errs)
          });
        })
      }, 'getNamesOfRegistrant' + authWallet.walletAddress, 3000).then(async (res) => {
        // console.log("my address result of registation", res)
        // for each res ,map it to NameModel
        let myNamesOfFavorite = await getMyFavourites()
        
        const names = res.map(n => {
          const expireAt = 'Expires ' + dateFormat(new Date(Number(n.expired_at)), "isoDateTime")
          let fav = myNamesOfFavorite.find(item => item === n.name);
          return { name: n.name, avaiable: false, expireAt, favorite: fav }
        })

        setNamesOfRegistrant(names)
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
            console.log(errs)
            reject(errs)
          });
        })
      }, 'namesOfController' + authWallet.walletAddress, 3000).then(async(res) => {
        console.log("my address result of controller", res)
        // for each res ,map it to NameModel
        let myNamesOfFavorite = await getMyFavourites()
        console.log(myNamesOfFavorite)
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authWallet.walletAddress])

  return (
    <div className={styles.serach}>
      <div className="container pt-5">
        <div className={styles['serach-content']}>
          <SearchInput />
          <Container className={`pt-5`}>
            {
              loading ?
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status"></div>
                </div> :
                <>
                  <div className={styles['search-address']}>
                    <span className={styles.icon}><i className="bi bi-person"></i></span>
                    <span className={styles.address}>{authWallet.walletAddress}</span>
                    <CopyToClipboard text={authWallet.walletAddress} />
                  </div>
                  <div className={styles['search-result']}>
                    <Tabs defaultActiveKey="registrant" className="mb-3">
                      <Tab eventKey="registrant" title="Registrant">
                        {
                          namesOfRegistrant.length > 0 ?
                            <div className={styles.list}>
                              {
                                namesOfRegistrant.map((item, index) => {
                                  return <Card key={index} name={item.name} regTime={item.expireAt} available={false} isMyAccount={true} favorite={item.favorite} />
                                })
                              }
                            </div> :
                            <div className="nodata"><span>No data</span></div>
                        }
                      </Tab>
                      <Tab eventKey="controller" title="Controller">
                        {
                          namesOfController.length > 0 ?
                            <div className={styles.list}>
                              {
                                namesOfController.map((item, index) => {
                                  return <Card key={index} name={item.name} regTime="" available={false} isMyAccount={true} favorite={item.favorite} />
                                })
                              }
                            </div> :
                            <div className="nodata"><span>No data</span></div>
                        }
                      </Tab>
                    </Tabs>
                  </div>
                </>
            }
          </Container>
        </div>
      </div>
    </div >
  )
}