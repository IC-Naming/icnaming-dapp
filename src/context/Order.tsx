import React, { useContext, useState } from "react";
import { Principal } from "@dfinity/principal";

export interface OrderContextInterface {
  name: string;
  status: any;
  paymentId: any;
  paymentMemo: any;
  priceIcpInE8s: any;
  years: number;
  // paymentAccountId: Principal;
  createOrder: (arg0: object) => void;
}

function useProvidePayOrder() {
  const [status, setStatus] = useState<any>()
  const [name, setName] = useState<string>('')
  const [paymentId, setPaymentId] = useState()
  const [paymentMemo, setPpaymentMemo] = useState()
  const [priceIcpInE8s, setPriceIcpInE8s] = useState()
  const [years, setYears] = useState<number>(1)
  const [paymentAccountId, setPaymentAccountId] = useState<Principal>()

  const createOrder = (orderObj) => {
    console.log('orderObj',orderObj)
    console.log('orderObj',orderObj.name)
    setStatus(orderObj.status);
    setName(orderObj.name);
    setPaymentId(orderObj.payment_id);
    setPpaymentMemo(orderObj.payment_memo);
    setPriceIcpInE8s(orderObj.price_icp_in_e8s);
    setYears(orderObj.years);
    setPaymentAccountId(orderObj.payment_account_id);
  }
  return {
    name: name,
    status: status,
    paymentId: paymentId,
    paymentMemo: paymentMemo,
    priceIcpInE8s: priceIcpInE8s,
    years: years,
    paymentAccountId: paymentAccountId,
    createOrder,
  }
}

export const OrderContext = React.createContext<OrderContextInterface>(null!);
export function ProvideOrderContext({ children }) {
  const payOrder = useProvidePayOrder();
  return <OrderContext.Provider value={payOrder}>{children}</OrderContext.Provider>;
}

export const useOrder = () => {
  return useContext(OrderContext);
};