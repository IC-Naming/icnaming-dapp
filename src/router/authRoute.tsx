import { Route, Redirect } from "react-router-dom";

export function AuthRoute(props: any) {
	const { routerConfig, location } = props;
	const { pathname } = location;
	const isConnected = sessionStorage.getItem("connectStatus");
	const targetRouterConfig = routerConfig.find(item =>
		item.path.replace(/\s*/g, "").split('/')[1] === pathname.split('/')[1]
	);

	if (targetRouterConfig && !targetRouterConfig.auth && !isConnected) {
		const { component } = targetRouterConfig;
		return <Route exact path={targetRouterConfig.path} component={component} />
	}
	if (isConnected) {
		if (targetRouterConfig) {
			return (<Route path={targetRouterConfig.path} component={targetRouterConfig.component} />);
		} else {
			return <Redirect to="/404" />;
		}
	} else {
		if (targetRouterConfig && targetRouterConfig.auth) {
			return <Redirect to="/" />;
		} else {
			return <Redirect to="/404" />;
		}
	}
}