import React from 'react';
import { Route, Redirect } from "react-router-dom";
import { useAuthWallet } from '../context/AuthWallet';
export function AuthRoute(props:any) {
  const { ...useAuth } = useAuthWallet()
  const targetRouteObj =  props;

  if (targetRouteObj && targetRouteObj.comingsoon) {
    return <Redirect to="/comingsoon"></Redirect>
  }

  if (targetRouteObj && !targetRouteObj.auth) {
    let { component, path } = targetRouteObj
    return (
      <Route exact path={path} component={component} />
    )
  }

  if (useAuth.isAuthWalletConnected) {
    if (targetRouteObj) {
      let { component, path } = targetRouteObj
      return <Route exact path={path} component={component}></Route>
    } else {
      return <Redirect to="/404"></Redirect>
    }
  } else if (targetRouteObj && targetRouteObj.auth) {
    return <Redirect to="/" />
  } else {
    return <Redirect to="/404" />
  }
}