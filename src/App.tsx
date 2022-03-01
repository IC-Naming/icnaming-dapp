import React from "react";
import "./assets/styles/App.scss";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import { ProvideConnectContext } from './context/AuthWallet';
import { ProvideMyInfoContext } from './context/MyInfo';
import routeMaps from "./router/routeMap"
import { AuthRoute } from "./router/authRoute"
import { Header, Footer } from "./components";
import { LocaleProvider } from '@douyinfe/semi-ui';
import en_US from '@douyinfe/semi-ui/lib/es/locale/source/en_US';
const App = () => {
  return (
    <div className="App">
      <Router basename="/">
        <LocaleProvider locale={en_US}>
          <ProvideConnectContext>
            <Header />
            <ProvideMyInfoContext>
              <Switch>
                {
                  routeMaps.map((routeData, index) => {
                    return (
                      <AuthRoute key={index} {...routeData} />
                    )
                  })
                }
              </Switch>
            </ProvideMyInfoContext>
          </ProvideConnectContext>
          <Footer />
        </LocaleProvider>
      </Router>
    </div>
  );
}
export default App;
