import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import styles from '../assets/styles/Name.module.scss'
import { PayVieQuota } from "components/PayVieQuota";
import { PayVieIcp } from "components/PayVieIcp";
import { Refund } from "components/Refund";
import { useAnalytics } from '../utils/GoogleGA';
export const Pay = (props) => {
  useAnalytics('Pay')
  const [icpPayAmountDesc, setIcpPayAmountDesc] = useState<string>('')
  const [hasRefund, setHasRefund] = useState<boolean>(false)
  const [quotaTypeCount, setQuotaTypeCount] = useState<any>(0);
  const [quotaType, setQuotaType] = useState<number>(7)
  const [orderInfoObj, setOrderInfoObj] = useState<{ name: string, nameLen: number, payStatus: object, payYears: number, payType: 'icp' | 'quota', quotaType?: number }>({
    name: '',
    nameLen: 0,
    payStatus: {},
    payYears: 1,
    payType: 'icp',
  })
  const orderInfo = localStorage.getItem('orderInfo');
  useEffect(() => {
    
    if (orderInfo) {
      const orderInfoObj = JSON.parse(orderInfo)
      setOrderInfoObj(orderInfoObj)
      console.log('pay myInfo', orderInfoObj)
      let nameLen = orderInfoObj.name.replace('.icp', "").length;
      nameLen = nameLen >= 7 ? 7 : nameLen;
      if (orderInfoObj.payType === 'icp') {
        const icpToCycles = localStorage.getItem('icpToCycles')
        if (icpToCycles) {
          const icpToCyclesObj = JSON.parse(icpToCycles)
          setIcpPayAmountDesc(`${icpToCyclesObj[nameLen - 1].icp} ICP ≈ ${icpToCyclesObj[nameLen - 1].cycles} T Cycles`)
        }
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
            <Row>
              <Col md={4} sm={12}>Registration Period </Col>
              <Col md={4} sm={12} className="text-center"> {orderInfoObj.payYears} Years</Col>
              <Col md={4} sm={12}></Col>
            </Row>
            {
              orderInfoObj.payType === 'quota' ?
                <PayVieQuota quotaType={quotaType} quotaTypeCount={quotaTypeCount} />
                :
                hasRefund ?
                  <Refund />
                  :
                  <PayVieIcp icpPayAmountDesc={icpPayAmountDesc} orderInfo={orderInfoObj} checkRefund={() => { setHasRefund(true) }} />
            }
          </div>
        </div>
      </div>
    </div>
  )
}