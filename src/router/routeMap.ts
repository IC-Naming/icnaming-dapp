import { Home } from "../pages/Home";
import { Search } from "../pages/Search";
import { MyAccount } from "../pages/MyAccount";
import { Favourites } from "../pages/Favourites";
import { Name } from "../pages/Name";
import { Pay } from "../pages/Pay";
import { Faq } from "../pages/Faq";
import { Error } from "../pages/Error";

const routeMaps = [
  { path: "/", exact: true, name: "Home", component: Home, auth: false },
  { path: "/search/:word", exact: false, name: "Search", component: Search, auth: false },
  { path: "/myaccount", exact: true, name: "MyAccount", component: MyAccount, auth: true },
  { path: "/favourites", exact: true, name: "Favourites", component: Favourites, auth: true },
  { path: "/name/:name/:action", exact: true, name: "Name", component: Name, auth: false },
  { path: "/pay", exact: true, name: "Pay", component: Pay, auth: true },
  { path: "/faq", exact: true, name: "Faq", component: Faq, auth: false },
  { path: "/404", exact: false, name: "NotFind", component: Error, auth: false },
];
export default routeMaps;