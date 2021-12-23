import React from "react";
import "./assets/styles/App.scss";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import { ProvideConnectContext } from './context/AuthWallet';
import routeMaps from "./router/routeMap"
import { AuthRoute } from "./router/authRoute"
import { Header, Footer } from "./components";

const App = () => {
  return (
    <div className="App">
      <Router basename="/">
        <ProvideConnectContext>
          <Header />
          <Switch>
            {
              routeMaps.map((routeData, index) => {
                return (
                  <AuthRoute key={index} {...routeData} />
                )
              })
            }
          </Switch>
          <Footer />
        </ProvideConnectContext>
      </Router>
    </div>
  );
}
export default App;
