import { useEffect, useState } from 'react'
import { SearchInput, Card, CopyToClipboard } from "../components";
import { Principal } from '@dfinity/principal';
import styles from '../assets/styles/Search.module.scss'
import { Container, Tab, Tabs } from 'react-bootstrap';
import serviceApi from '../utils/ServiceApi';
import { useAuthWallet } from '../context/AuthWallet';
import dateFormat from "dateformat";
import { queryWithCache } from '../utils/localCache';
import { Skeleton, Pagination, List, Input } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
export const MyAccount = () => {
  const { ...authWallet } = useAuthWallet();
  const [loading, setLoading] = useState<boolean>(true)
  const [namesOfRegistrant, setNamesOfRegistrant] = useState<any>();
  const [namesOfController, setNamesOfController] = useState<any>();
  const [searchNamesOfRegistrant, setSearchNamesOfRegistrant] = useState<any>([]);
  const [searchNamesOfController, setSearchNamesOfController] = useState<any>([]);
  const [pageReg, onPageRegChange] = useState<number>(1);
  const [pageCtrl, onPageCtrlChange] = useState<number>(1);
  let pageSize = 5;

  const getData = (page: number, list) => {
    let start = (page - 1) * pageSize;
    let end = page * pageSize;
    return list.slice(start, end)
  }

  const onSearch = (searchName: string, list: any[], searchType: string) => {
    let newList: any;
    if (searchName) {
      newList = list.filter(item => item.name.includes(searchName));
    } else {
      newList = list
    }
    searchType === 'registrant' ? setSearchNamesOfRegistrant(newList) : setSearchNamesOfController(newList)
    onPageRegChange(1);
  };

  const getMyFavourites = async () => {
    let myFavoriteNamesStorage = JSON.parse(localStorage.getItem('myFavoriteNames') || '[]');
    if (myFavoriteNamesStorage && myFavoriteNamesStorage.length > 0) {
      return myFavoriteNamesStorage;
    } else {
      return await queryWithCache(async () => {
        const favoriteNamesSevice = await (await serviceApi).getFavoriteNames()
        localStorage.setItem('myFavoriteNames', JSON.stringify(favoriteNamesSevice))
        return (await serviceApi).getFavoriteNames();
      }, 'myNamesOfFavorite' + authWallet.wallet?.accountId);
    }
  }

  useEffect(() => {

    if (authWallet.wallet?.principalId) {
      const wordParam: Principal = authWallet.wallet?.principalId;
      let getNamesOfRegistrantLoaded = false;
      let getNamesOfControllerLoaded = false;

      queryWithCache(() => {
        return new Promise(async (resolve, reject) => {
          (await serviceApi).getNamesOfRegistrant(wordParam).then(data => {
            resolve(data)
          }).catch(errs => {
            reject(errs)
          });
        })
      }, 'getNamesOfRegistrant' + authWallet.wallet.accountId, 60).then(async (res) => {
        // console.log("my address result of Registrant", res)
        // for each res ,map it to NameModel
        let myNamesOfFavorite = await getMyFavourites()
        let namesOfRegistrant = res.sort((a, b) => {
          return a.expired_at > b.expired_at ? -1 : 1
        }).map(item => {
          return {
            name: item.name,
            expireAt: 'Expires ' + dateFormat(new Date(Number(item.expired_at)), "isoDateTime"),
            favorite: myNamesOfFavorite.includes(item.name)
          }
        })

        setNamesOfRegistrant(namesOfRegistrant)
        setSearchNamesOfRegistrant(namesOfRegistrant)
        getNamesOfRegistrantLoaded = true;
        if (getNamesOfRegistrantLoaded && getNamesOfControllerLoaded)
          setLoading(false)
      }).catch(err => {
        console.log(err)
        setLoading(false)
      });

      queryWithCache(() => {
        return new Promise(async (resolve, reject) => {
          (await serviceApi).getNamesOfController(wordParam).then(data => {
            resolve(data)
          }).catch(errs => {
            reject(errs)
          });
        })
      }, 'namesOfController' + authWallet.wallet.accountId).then(async (res) => {
        // console.log("my address result of controller", res)
        // for each res ,map it to NameModel
        let myNamesOfFavorite = await getMyFavourites()
        let namesOfController = res.sort((a, b) => {
          return a > b ? 1 : -1
        }).map(item => {
          return {
            name: item,
            favorite: myNamesOfFavorite.includes(item)
          }
        })
        setNamesOfController(namesOfController)
        setSearchNamesOfController(namesOfController)
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
  }, [authWallet.wallet])

  const myAccountId = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', width: '80%', marginBottom: '2rem' }}>
        <Skeleton.Avatar style={{ width: 70, height: 60, marginRight: '1rem' }} />
        <Skeleton.Title style={{ width: '100%', height: 32 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Skeleton.Button style={{ marginRight: 5 }} />
          <Skeleton.Button />
        </div>
        <Skeleton.Title style={{ width: 200, height: 40 }}></Skeleton.Title>
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
                <span className={styles.address}>{authWallet.wallet?.principalId.toText()}</span>
                <CopyToClipboard text={authWallet.wallet?.principalId.toText()} />
              </Skeleton>
            </div>
            {
              loading ? null :
                <div className={styles['search-result']}>

                  <Tabs defaultActiveKey="registrant" className="mb-3">
                    <Tab eventKey="registrant" title="Registrant">
                      <List
                        dataSource={getData(pageReg, searchNamesOfRegistrant)}
                        split={false}
                        className={styles['myaccount-list']}
                        header={<Input onEnterPress={
                          (e) => {
                            e.preventDefault();
                            console.log(e.currentTarget.value)
                            onSearch(e.currentTarget.value.replace(/\s+/g, ''), namesOfRegistrant, 'registrant')
                          }
                        }
                          onChange={(v) => !v ? onSearch('', namesOfRegistrant, 'registrant') : null} placeholder='Search name' prefix={<IconSearch />} />}
                        renderItem={item =>
                          <Card key={item.name} name={item.name} expireAt={item.expireAt} available={false} isMyAccount={true} favorite={item.favorite} />
                        }
                      />
                      {
                        searchNamesOfRegistrant.length > 0 && <Pagination className='ic-pagination'
                          pageSize={pageSize} currentPage={pageReg}
                          total={searchNamesOfRegistrant.length} onChange={cPage => onPageRegChange(cPage)}></Pagination>
                      }
                    </Tab>
                    <Tab eventKey="controller" title="Controller">
                      <List
                        dataSource={getData(pageReg, searchNamesOfController)}
                        split={false}
                        className={styles['myaccount-list']}
                        header={<Input
                          onEnterPress={
                            (e) => {
                              e.preventDefault();
                              console.log(e.currentTarget.value)
                              onSearch(e.currentTarget.value.replace(/\s+/g, ''), namesOfController, 'controller')
                            }
                          }
                          onChange={(v) => !v ? onSearch('', namesOfController, 'controller') : null}
                          placeholder='Search name' prefix={<IconSearch />} />}
                        renderItem={item =>
                          <Card name={item.name} expireAt="" available={false} isMyAccount={true} favorite={item.favorite} />
                        }
                      />
                      {
                        searchNamesOfController.length > 0 && <Pagination className='ic-pagination' pageSize={pageSize} currentPage={pageCtrl} total={searchNamesOfController.length} onChange={cPage => onPageCtrlChange(cPage)}></Pagination>
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