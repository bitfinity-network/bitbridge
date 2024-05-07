import {
  Actor,
  ActorSubclass,
  Identity,
  ActorMethod,
  HttpAgent,
} from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";

import {
  idlFactory as Icrc1IDL,
  _SERVICE as Icrc1Service,
} from "./idl/icrc1/icrc1.did";

const IC_HOST = "https://ic0.app";
const IC_ENVIRON = "testnet";
export const icNetwork = {
  icHost: IC_HOST,
  icEnviron: IC_ENVIRON,
};

interface IcConnectorOptions {
  host?: string;
  identity?: Identity | undefined;
  environ?: string;
}
export class IcConnector {
  private host: string;
  private identity?: Identity | undefined;
  private agent: HttpAgent;
  private environ: string;

  constructor(options: IcConnectorOptions | undefined = {}) {
    this.host = options.host || icNetwork.icHost;
    this.identity = options.identity ?? undefined;
    this.environ = options.environ || icNetwork?.icEnviron;

    this.agent = this.initAgent();
  }

  initAgent() {
    const agent = new HttpAgent({
      host: this.host,
      identity: this.identity,
    });

    if (this.environ === "local") {
      agent.fetchRootKey();
    }
    return agent;
  }

  getAgent(): HttpAgent {
    return this.agent;
  }

  actor<T = Record<string, ActorMethod>>(
    cid: string | Principal,
    idl: IDL.InterfaceFactory
  ): ActorSubclass<T> {
    return Actor.createActor(idl, {
      agent: this.agent,
      canisterId: cid,
    });
  }
}

export { Icrc1IDL };
export type { Icrc1Service };
