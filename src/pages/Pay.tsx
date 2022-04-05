import { useState, useEffect } from "react";
import styles from '../assets/styles/Name.module.scss'
import { PayVieQuota } from "components/PayVieQuota";
import { PayVieIcp } from "components/PayVieIcp";
import { Refund } from "components/Refund";
import { PayVieIcpNns } from "components/PayVieIcpNns";
export const Pay = () => {
  const [hasRefund, setHasRefund] = useState<boolean>(false)
  const [quotaTypeCount, setQuotaTypeCount] = useState<any>(0);
  const [quotaType, setQuotaType] = useState<number>(7)
  const [orderInfoObj, setOrderInfoObj] = useState<{ name: string, nameLen: number, payStatus: object, payYears: number, payType: 'icp' | 'quota', quotaType?: number }>({
    name: '',
    nameLen: 0,
    payStatus: {},
    payYears: 1,
    payType: 'quota',
  })
  const orderInfo = localStorage.getItem('orderInfo');
  useEffect(() => {
    if (orderInfo) {
      const orderInfoObj = JSON.parse(orderInfo)
      setOrderInfoObj(orderInfoObj)
      console.log('pay myInfo', orderInfoObj)
      if (orderInfoObj.payType === 'icp') {
        if ("WaitingToRefund" in orderInfoObj.payStatus) {
          setHasRefund(true)
        }
      } else if (orderInfoObj.quotaType) {
        setQuotaType(orderInfoObj.quotaType)
        const myQuotas = localStorage.getItem('myQuotas');
        if (myQuotas) {
          const myQuotasObj = JSON.parse(myQuotas)
          setQuotaTypeCount(myQuotasObj[orderInfoObj.quotaType - 4])
        }
      }
    }
  }, [orderInfo])

  return (
    <div className={styles['name-wrap']}>
      <div className="container pt-5">
        <div className={`${styles['name-content']} ${styles['pay-content']}`}>
          <h1 className={`${styles.title} text-right`}>{orderInfoObj.name}</h1>
          <div className={styles.register}>
            {
              orderInfoObj.payType === 'quota' ?
                <PayVieQuota quotaType={quotaType} quotaTypeCount={quotaTypeCount} />
                :
                hasRefund ?
                  <Refund />
                  :
                  <>
                    {
                      sessionStorage.getItem('walletType') === 'Nns' ?
                        <PayVieIcpNns orderInfo={orderInfoObj} checkRefund={() => { setHasRefund(true) }} />
                        :
                        <PayVieIcp orderInfo={orderInfoObj} checkRefund={() => { setHasRefund(true) }} />
                    }
                  </>
            }
          </div>
        </div>
      </div>
    </div>
  )
}