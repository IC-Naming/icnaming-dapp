import React from "react";
import "./assets/styles/App.scss";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ProvideConnectContext } from './context/AuthWallet';
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { MyAccount } from "./pages/MyAccount";
import { Favourites } from "./pages/Favourites";
import { Name } from "./pages/Name";
import { Press } from "./pages/Press";
import { Header ,Footer} from "./components";

export default function App() {
  return (
    <div className="App">
      
      <Router>
        <ProvideConnectContext>
          <Header />
            <Route exact path="/" component={Home} />
            <Route exact path="/search/:word" component={Search} />
            <Route exact path="/myaccount" component={MyAccount} />
            <Route exact path="/favourites" component={Favourites} />
            <Route exact path="/name/:name/:action" component={Name} />
            <Route exact path="/presskit" component={Press} />
        </ProvideConnectContext>
        <Footer/>
      </Router>
    </div>
  );
}
