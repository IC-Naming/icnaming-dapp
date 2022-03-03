import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { Modal, Timeline, Spin } from "@douyinfe/semi-ui";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import styles from '../assets/styles/Name.module.scss'
import payStyles from '../assets/styles/Pay.module.scss'
import { useAuthWallet } from '../context/AuthWallet';
import ServiceApi from "../utils/ServiceApi";
import { deleteCache } from "../utils/localCache";
import { CancelOrderIcp } from "components/CancelOrderIcp";
declare var window: any;
interface IcpPayProps {
  icpPayAmountDesc: string;
  orderInfo: {
    name: string,
    nameLen: number,
    payStatus: object,
    payYears: number,
  };
  checkRefund: () => void;
}

export const PayVieIcp: React.FC<IcpPayProps> = ({ icpPayAmountDesc, orderInfo, checkRefund }) => {
  const history = useHistory();
  const serviceApi = new ServiceApi();
  const { ...auth } = useAuthWallet();
  const [loading, setLoading] = useState<boolean>(false)
  const [icpPayIng, setIcpPayIng] = useState<boolean>(false)
  const [icpPayStatus, setIcpPayStatus] = useState<boolean>(false)
  const [systemDetermine, setSystemDetermine] = useState<boolean>(false)
  const [systemStatus, setSystemStatus] = useState<boolean>(false)
  const [systemStatusText, setSystemStatusText] = useState<any>('')
  const [payHeight, setPayHeight] = useState<number>(0)

  /**
   * try to confirm order payment for several times
   * go to my account when it confirms success
   * reload current order if it fails
   */
  const confirmSystem = async () => {
    enum ConfirmStatus {
      Success,
      Fail,
      Exception
    }

    console.log('payHeight-----------', payHeight);
    console.assert(payHeight > 0, 'payHeight must be greater than 0');
    // get confirm status
    let confirmStatus = await (async () => {
      const max_retry = 3;
      let result_status = ConfirmStatus.Success;
      for (let i = 0; i < max_retry; i++) {
        try {
          let result = await serviceApi.confirmOrder(BigInt(payHeight));
          if (result) {
            result_status = ConfirmStatus.Success;
            break;
          } else {
            result_status = ConfirmStatus.Fail;
          }
        } catch (error) {
          console.error(`exception when confirm order: ${error}`);
          return ConfirmStatus.Exception;
        }
      }
      return result_status;
    })();

    console.log(`confirm status: ${confirmStatus}`);

    // remove cache
    deleteCache('getNamesOfRegistrant' + auth.walletAddress);
    deleteCache('namesOfController' + auth.walletAddress);

    // handle status
    switch (confirmStatus) {
      case ConfirmStatus.Success:
        setSystemStatus(true);
        console.log('You got the name! please check it out from MyAccount');
        localStorage.removeItem('orderInfo');
        break;
      case ConfirmStatus.Exception:
        setSystemDetermine(true)
        setSystemStatus(false)
        localStorage.removeItem('orderInfo');
        // TODO make user to click confirm button again
        break;
      case ConfirmStatus.Fail:
        // name is not available or invalid request from client
        setSystemStatus(false);
        console.log('fail confirm order, but payment success');
        // TODO try to reload current order, it should be status "refund" in normal case
        break;
    }

  }

  useEffect(() => {
    if (payHeight !== 0) {
      confirmSystem();
    }
    return () => {
      setPayHeight(0)
    }
  }, [payHeight])// eslint-disable-line react-hooks/exhaustive-deps

  const payVidIcp = async () => {
    if (loading) return
    setLoading(true)
    setIcpPayIng(true)

    const [availableResult, orderResult] = await Promise.all([serviceApi.available(orderInfo.name).catch(err => {
      setLoading(false)
      setIcpPayIng(false)
      toast.error(err.message, {
        position: 'top-center',
        autoClose: 2000,
        theme: 'dark'
      })
    }), serviceApi.getPendingOrder()]);

    if (availableResult !== true) {
      setLoading(false)
      setIcpPayIng(false)
      toast.warning('name is not available', {
        position: 'top-center',
        theme: 'dark'
      })
      return
    } else {
      if (orderResult.length === 0) {
        setLoading(false)
        setIcpPayIng(false)
        toast.error('no pending order', {
          position: 'top-center',
          theme: 'dark'
        })
        return
      } else if ("WaitingToRefund" in orderResult[0].status) {
        checkRefund();
        setLoading(false);
        setIcpPayIng(false);
        return
      }
    }
    let order = orderResult[0];
    const arrayToHex = (arr: Array<number>) => {
      return arr.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")
    }
    try {
      console.log(payHeight)
      if (payHeight === 0) {
        const payResult = await window.ic.plug.requestTransfer({
          to: arrayToHex(order.payment_account_id),
          amount: Number(order.price_icp_in_e8s),
          opts: {
            fee: 10000,
            memo: order.payment_memo.ICP.toString(),
          },
        });
        console.log(`Pay success: ${JSON.stringify(payResult)}`);
        setPayHeight(payResult.height)
        setIcpPayIng(false);
        setIcpPayStatus(true);
      }else{
        setIcpPayIng(false);
        setIcpPayStatus(true);
      }
    } catch (err) {
      setIcpPayIng(false)
      setIcpPayStatus(false)
      console.log(`Payment failed: ${JSON.stringify(err)}`);
      return
    }
  }

  return (
    <>
      <Row>
        <Col md={4} sm={12}>Registration to Price</Col>
        <Col md={4} sm={12} className="text-center">{icpPayAmountDesc}</Col>
        <Col md={4} sm={12}></Col>
      </Row>
      <div className={payStyles['btn-pay-wrap']}>
        <CancelOrderIcp name={orderInfo.name} />
        {
          payHeight === 0 &&
          <button className={`${styles.btn} ${payStyles['btn-pay-quota']}`} onClick={() => { payVidIcp() }}>
            {loading && <Spinner animation="border" size="sm" style={{ marginRight: 10 }} />}Pay
          </button>
        }
      </div>

      <Modal
        header={null}
        footer={null}
        visible={loading}
        maskClosable={false}
        className={payStyles['modal-wrap-icpPay']}
      >
        {
          systemDetermine
            ?
            <div>
              {
                systemStatus ?
                  <div className={payStyles['success-icpreg']}>
                    Congratulations! <br />Now you are the owner of <br />[ {orderInfo.name} ]
                  </div> :
                  <div className={payStyles['success-icpreg']}>
                    {systemStatusText}
                  </div>
              }
              <div className="d-grid gap-2">
                <button className={payStyles['btn']} onClick={() => { history.push('/myaccount') }}>Go to MyAccount</button>
              </div>
            </div>
            :
            <>
              <Timeline className={payStyles['paymentIcpTimeline']}>
                {
                  icpPayIng &&
                  <Timeline.Item type="ongoing">{icpPayIng && <Spin size="small" />}Payment in progress</Timeline.Item>
                }
                {
                  icpPayIng ? null :
                    icpPayStatus ?
                      < React.Fragment >
                        <Timeline.Item type="success">Payment success</Timeline.Item>
                        <Timeline.Item color="pink">
                          <Spin size="small" />It's almost done, ICNaming is doing the final confirmation.</Timeline.Item>
                      </React.Fragment>
                      :
                      <Timeline.Item type="error">
                        Failed to transfer, please DO NOT retry to pay before checking your balance. If you find out your balance is taken, please wait and check in "My Account" page by refreshing, your order will be confirmed automatically by system within 5 minutes.
                      </Timeline.Item>
                }
              </Timeline>
              {
                icpPayIng ? null :
                  !icpPayStatus &&
                  <div className={payStyles['btn-wrap']}>
                    <button className={payStyles['btn']} onClick={() => { setLoading(false) }}>Cancel</button>
                  </div>
              }
            </>
        }
      </Modal>
    </>
  )
}