import { getArgTypes } from "./sign";
import proxy from "./proxy";
import { createAgent, createActor } from "./agent";
import { Buffer } from "buffer/";
// @ts-ignore
window.Buffer = window.Buffer || Buffer;

declare global {
	interface Window {
		ReactNativeWebView: any;
		__isIcpBoxConnected: boolean;
	}
}

let agent;
let publicKey;
const idls: any = [];

type PayType = {
	amount: string;
	to: string;
	host?: string;
	icon?: string;
	memo?: string;
	fee?: string;
};

const icpbox = {
	get webview() {
		return window.ReactNativeWebView;
	},
	get publicKey() {
		return publicKey;
	},
	setPublickKey(val: any) {
		console.log('setPublickKey', val)
		publicKey = val;
	},
	check: function () {
		return "ReactNativeWebView" in window;
	},
	isConnected: function () {
		return proxy("isConnected", {});
	},
	authorize: function (opts: {
		canisters: string[];
		host?: string;
		icon?: string;
	}) {
		opts.host = window.location.host;
		opts.icon = opts.icon || window.location.origin + "/favicon.ico";
		return proxy("authorize", opts);
	},
	pay: function (data: PayType) {
		data.host = data.host || window.location.host;
		data.icon = data.icon || window.location.origin + "/favicon.ico";
		data.fee = data.fee || "10000";

		return proxy("pay", data);
	},

	async createActor({ canisterId, interfaceFactory }) {
		idls[canisterId] = getArgTypes(interfaceFactory);
		if (!agent) {
			agent = await createAgent(
				publicKey,
				{
					whitelist: [canisterId],
				},
				idls
			);
		}

		return createActor(agent, canisterId, interfaceFactory);
	},
	/**
	 * dis connect wallet
	 */
	disConnect() {
		return proxy("disConnect", { host: window.location.host });
	},
};
export default icpbox;
