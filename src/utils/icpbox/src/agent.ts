import { HttpAgent, Actor, ActorSubclass } from "@dfinity/agent";
import { IC_MAINNET_URLS } from "./constants";

import { WalletIdentity } from "./identity";
import { signFactory } from "./sign";
import PublicKey from "./publicKey";
import { blobFromHex } from "./types";

export interface CreateAgentParams {
  whitelist?: string[];
  host?: string;
}

interface CreateAgentParamsFixed {
  whitelist: string[];
  host: string;
}

const DEFAULT_HOST = IC_MAINNET_URLS[0];
/* eslint-disable @typescript-eslint/no-unused-vars */
const DEFAULT_CREATE_AGENT_ARGS: CreateAgentParamsFixed = {
  whitelist: [],
  host: DEFAULT_HOST,
};

export const createAgent = async (
  publicKey: string,
  {
    whitelist = DEFAULT_CREATE_AGENT_ARGS.whitelist,
    host = DEFAULT_CREATE_AGENT_ARGS.host,
  }: CreateAgentParams,
  idls,
  preApprove = false
) => {
  const key = PublicKey.fromRaw(blobFromHex(publicKey));

  const identity = new WalletIdentity(
    key,
    signFactory(idls, { host, name: "host" }, preApprove),
    whitelist
  );

  const agent = new HttpAgent({
    identity,
    host,
  });
  if (!IC_MAINNET_URLS.includes(host)) {
    await agent.fetchRootKey();
  }
  return agent;
};

export const createActor = async <T>(
  agent,
  canisterId: string,
  interfaceFactory
): Promise<ActorSubclass<T>> => {
  return Actor.createActor(interfaceFactory, {
    agent: agent,
    canisterId,
  });
};
