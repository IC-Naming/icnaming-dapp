import { getArgTypes } from "./src/sign";
import proxy from "./src/proxy";
import { createAgent, createActor } from "./src/agent";
import { ActorSubclass } from "@dfinity/agent";

import { Buffer } from "buffer/";
// @ts-ignore
window.Buffer = window.Buffer || Buffer;

declare global {
  interface Window {
    ReactNativeWebView: any;
    __isIcpBoxConnected: boolean;
  }
}

const cacheKey = "icpbox:publicKey";
let agent;
let publicKey = localStorage.getItem(cacheKey);
const idls:any = [];

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
  setPublickKey(val: string) {
    publicKey = val;
    localStorage.setItem(cacheKey, val);
  },
  check: function () {
    return (
      "ReactNativeWebView" in window && navigator.userAgent.match("ICPBox/")
    );
  },
  isConnected: async function () {
    const res = await proxy("isConnected", {});
    return res.result;
  },
  authorize: async function (opts: {
    canisters: string[];
    host?: string;
    icon?: string;
  }) {
    opts.host = window.location.host;
    opts.icon = opts.icon || window.location.origin + "/favicon.ico";
    const res = await proxy<{ publicKey: string }>("authorize", opts);

    this.setPublickKey(res.publicKey);
    return res;
  },
  pay: function (data: PayType) {
    data.host = data.host || window.location.host;
    data.icon = data.icon || window.location.origin + "/favicon.ico";
    data.fee = data.fee || "10000";

    return proxy("pay", data);
  },

  async createActor<T>({
    canisterId,
    interfaceFactory,
  }): Promise<ActorSubclass<T>> {
    idls[canisterId] = getArgTypes(interfaceFactory);
    if (!agent && publicKey) {
      agent = await createAgent(
        publicKey,
        {
          whitelist: [canisterId],
        },
        idls
      );
    }

    return createActor<ActorSubclass<T>>(agent, canisterId, interfaceFactory);
  },
  /**
   * dis connect wallet
   */
  disConnect() {
    return proxy("disConnect", { host: window.location.host });
  },
};
export default icpbox;