import { Home } from "../pages/Home";
import { Search } from "../pages/Search";
import { MyAccount } from "../pages/MyAccount";
import { Favourites } from "../pages/Favourites";
import { Name } from "../pages/Name";
import { About } from "../pages/About";
import { Faq } from "../pages/Faq";
import { Error } from "../pages/Error";
import { ComingSoon } from "../pages/ComingSoon";

const routeMaps =[
  { path: "/",exact:true, name: "Home", component: Home, auth: false ,comingsoon:false },
  { path: "/search/:word",exact:false, name: "Search", component: Search, auth: false ,comingsoon:false },
  { path: "/myaccount",exact:true, name: "MyAccount", component: MyAccount, auth: true ,comingsoon:false },
  { path: "/favourites",exact:true, name: "Favourites", component: Favourites, auth: true ,comingsoon:false },
  { path: "/name/:name/:action",exact:true, name: "Name", component: Name, auth: false ,comingsoon:false },
  { path: "/about", name: "About",exact:true, component: About, auth: false ,comingsoon:true },
  { path: "/faq", name: "Faq",exact:true, component: Faq, auth: false ,comingsoon:true },
  { path: "/comingsoon",exact:true, name: "ComingSoon", component: ComingSoon, auth: false ,comingsoon:false },
  { path: "/404",exact:false, name: "NotFind", component: Error, auth: false ,comingsoon:false },
];
export default routeMaps;