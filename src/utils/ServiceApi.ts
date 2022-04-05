import { Principal } from "@dfinity/principal";
import { AsyncConstructor } from 'async-constructor'
import {
  createRegistrarQueryActor,
  createRegistrarUpdateActor,
  PagingArgs,
  RegistrarActor,
  Registration,
} from "./canisters/registrar";
import {
  GetNameOrderResponse,
  PriceTableItem,
  QuotaType,
  SubmitOrderResponse,
} from "./canisters/registrar/interface";
import {
  createWhiteListQueryActor,
  // createWhiteListUpdateActor,
  WhiteListActor,
} from "./canisters/whiteList";
import {
  createRegistryQueryActor,
  //createRegistryUpdateActor,
  RegistryActor,
} from "./canisters/registry";
import {
  createResolverQueryActor,
  createResolverUpdateActor,
  ResolverActor,
} from "./canisters/resolver";
import { createLedgerActor, LedgerActor } from "./canisters/ledger";
import { createFavoriteActor, FavoritesActor } from "./canisters/favorites";
// import { WHITE_LIST_PROXY_API } from "./config";
import { executeWithLogging } from "./errorLogger";
import { RegistrationDetails } from "./canisters/registrar/interface";
import { RegistryDto } from "./canisters/registry/interface";
import { CanisterError } from "./exception";

export interface NameDetails {
  name: string;
  available: boolean;
  registrant: Principal | string;
  controller: Principal | string;
  resolver: Principal | string;
  expireAt: Date | string;
}

export default class ServiceApi extends AsyncConstructor {
  private registrarQueryActor!: RegistrarActor;
  private registrarUpdateActor!: RegistrarActor | undefined;
  private whiteListQueryActor!: WhiteListActor;
  private registryQueryActor!: RegistryActor;
  private resolverQueryActor!: ResolverActor;
  private resolverUpdateActor!: ResolverActor | undefined;
  private favoritesActor!: FavoritesActor | undefined;
  private ledgerActor!: LedgerActor | undefined;

  public constructor() {
    super(async () => {
      this.registrarUpdateActor = await createRegistrarUpdateActor();
      this.resolverUpdateActor = await createResolverUpdateActor();
      this.favoritesActor = await createFavoriteActor();
      this.ledgerActor = await createLedgerActor();
    });
    this.registrarQueryActor = createRegistrarQueryActor();
    this.whiteListQueryActor = createWhiteListQueryActor();
    this.registryQueryActor = createRegistryQueryActor();
    this.resolverQueryActor = createResolverQueryActor();
  }


  public async payledger(payment_account_id: any, price_icp_in_e8s: bigint, payment_memo: bigint): Promise<bigint> {
    return new Promise(async (resolve, reject) => {
      try {
        const res: any = await this.ledgerActor?.transfer({
          amount: {
            e8s: price_icp_in_e8s
          },
          memo: payment_memo,
          to: payment_account_id,
          fee: {
            e8s: BigInt(10_000),
          },
          created_at_time: [],
          from_subaccount: []
        });
        if ("Ok" in res) {
          resolve(res.Ok);
        } else {
          reject(res.Err);
        }
      } catch (error) {
        reject(error);
      }
    })
  }

  // get icp && cycles
  public async getIcpToCycles(): Promise<PriceTableItem[]> {
    // console.log('nameLen', nameLen)
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_price_table();
      if ('Ok' in res) {
        // const t:PriceTableItem = res.Ok.items.find(x => x.len === nameLen)!;
        return res.Ok.items;
      } else {
        throw new CanisterError(res.Err);
      }
    }, 'getIcpToCycles');
  }


  // names or addresses search
  public available = (word: string): Promise<boolean> => {
    // if word is string and not empty
    if (word.length > 0) {
      return executeWithLogging(async () => {
        const res = await this.registrarQueryActor.available(word);
        // console.log('registrarQueryActor-available', res);
        if ("Ok" in res) {
          return res.Ok;
        } else {
          throw new CanisterError(res.Err);
        }
      }, "available");
    } else return Promise.reject(new Error("Invalid search word"));
  };

  // get name expires
  public expireAtOf = (name: string): Promise<number> => {
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_name_expires(name);
      if ("Ok" in res) {
        return Number(res.Ok);
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  /* Registrar */
  //reg name by quota
  public registerNameByQuota = (
    name: string,
    quota: number
  ): Promise<boolean> => {
    const quotaParsed: QuotaType = { LenGte: quota };
    return new Promise(async (resolve, reject) => {
      createRegistrarUpdateActor().then(actor => {
        if (actor !== undefined) {
          actor.register_with_quota(name, quotaParsed).then(res => {
            if ("Ok" in res) {
              resolve(res.Ok);
            } else {
              throw new CanisterError(res.Err);
            }
          })
        }
      });
    })
  };

  // submit order
  public submitRegisterOrder = (
    name: string,
    years: number
  ): Promise<SubmitOrderResponse> => {
    return executeWithLogging(async () => {
      // console.log("reg name", name);
      const res: any = await this.registrarUpdateActor?.submit_order({ name, years });
      console.log('submit_order', res);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "submitRegisterOrder");
  };

  // cancel order
  public cancelRegisterOrder = () => {
    return executeWithLogging(async () => {
      const res: any = await this.registrarUpdateActor?.cancel_order();
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  }

  // cancel order icp
  public refundOrder = (): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res: any = await this.registrarUpdateActor?.refund_order();
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "refundOrder");
  }

  // get pending order
  public getPendingOrder = (): Promise<[] | [GetNameOrderResponse]> => {
    console.log(this.registrarUpdateActor)
    return executeWithLogging(async () => {
      let pendingOrder: [GetNameOrderResponse] | [] = [];
      if (this.registrarUpdateActor !== undefined) {
        const res: any = await this.registrarUpdateActor?.get_pending_order();
        console.log('get_pending_order', res);
        if ("Ok" in res) {
          pendingOrder = res.Ok;
        } else {
          throw new CanisterError(res.Err);
        }
        return pendingOrder;
      } else {
        throw new Error('registrarUpdateActor is undefined');
      }
    }, "getPendingOrder");
  };

  // confirm order
  public confirmOrder = (block_height: bigint): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res: any = await this.registrarUpdateActor?.confirm_pay_order(block_height);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "confirmOrder");
  };

  // get credit
  public creditOfEthAddress = (ethAddress: string): Promise<number> => {
    return executeWithLogging(async () => {
      const res: any = await this.whiteListQueryActor.refStatus(ethAddress);
      console.log("creditOfEthAddress", res);
      if ("Ok" in res) {
        return Number(res.Ok.credit);
      } else {
        throw new CanisterError(res.Err);
      }
    }, "creditOfEthAddress");
  };

  // set record
  public setRecord = (
    name: string,
    key: string,
    value: string
  ): Promise<boolean> => {
    console.table({ name: name, key: key, value: value });
    return executeWithLogging(async () => {
      const res: any = await this.resolverUpdateActor?.set_record_value(name, [
        [key, value],
      ]);
      // console.log("setRecord", res);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "setRecord");
  };

  public getNamesOfRegistrant = (
    address: Principal
  ): Promise<Array<Registration>> => {
    const pagingArgs: PagingArgs = {
      offset: BigInt(0),
      limit: BigInt(100),
    };
    // console.log('getNamesOfRegistrant----------', address)
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_names(address, pagingArgs);
      // console.log('getNamesOfRegistrant----------', res)
      if ("Ok" in res) {
        return res.Ok.items;
      } else {
        throw new CanisterError(res.Err);
      }
    });
  };

  public getNamesOfController = (
    address: Principal
  ): Promise<Array<string>> => {
    const pagingArgs: PagingArgs = {
      offset: BigInt(0),
      limit: BigInt(100),
    };
    return executeWithLogging(async () => {
      const res = await this.registryQueryActor.get_controlled_names(
        address,
        pagingArgs
      );
      // console.log('getNamesOfController----------', res)
      if ("Ok" in res) {
        return res.Ok.items;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "getNamesOfController");
  };

  // get name's registrant
  public getRegistrantOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_owner(name);
      // console.log("getRegistrantOfName", res);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        return Principal.anonymous();
        // throw new CanisterError(res.Err);
      }
    });
  };

  // get name's controller
  public getControllerOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res = await this.registryQueryActor.get_owner(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "getControllerOfName");
  };

  // get name's resolver
  public getResolverOfName = (name: string): Promise<Principal> => {
    return executeWithLogging(async () => {
      const res = await this.registryQueryActor.get_resolver(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "getResolverOfName");
  };

  // get name's RegistrationDetails
  public getRegistrationDetailsOfName = (
    name: string
  ): Promise<RegistrationDetails> => {
    return executeWithLogging(async () => {
      const res = await this.registrarQueryActor.get_details(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        // throw new CanisterError(res.Err);
        return {
          'owner': Principal.anonymous(),
          'name': '',
          'created_at': BigInt(0),
          'expired_at': BigInt(0),
        }
      }
    }, "getRegistrationDetailsOfName");
  };

  // get name's records
  public getRecordsOfName = (
    name: string
  ): Promise<Array<[string, string]>> => {
    return executeWithLogging(async () => {
      const res = await this.resolverQueryActor.get_record_value(name);
      // console.log('get_record_value', res)
      if ("Ok" in res) {
        return res.Ok;
      } else {
        console.log(res.Err)
        return [];
        // throw new CanisterError(res.Err);
      }
    }, "getRecordsOfName");
  };

  // get details of name  registry
  public getRegistryDetailsOfName = (name: string): Promise<RegistryDto> => {
    return executeWithLogging(async () => {
      const res: any = await this.registryQueryActor.get_details(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        // throw new CanisterError(res.Err);
        return {
          'ttl': BigInt(0),
          'resolver': Principal.anonymous(),
          'owner': Principal.anonymous(),
          'name': '',
        }
      }
    }, "getRegistryDetailsOfName");
  };

  // get quota
  public getQuota = (user: Principal, quotaType: number): Promise<number> => {
    return executeWithLogging(async () => {
      let quota: number = 0;
      const quotaParsed: QuotaType = { LenGte: quotaType };
      if (this.registrarUpdateActor !== undefined) {
        const res: any = await this.registrarUpdateActor?.get_quota(user, quotaParsed);
        if ("Ok" in res) {
          quota = Number(res.Ok);
        } else {
          quota = 0;
          throw new CanisterError(res.Err);
        }
        return quota;
      } else {
        throw new Error('registrarUpdateActor is undefined');
      }
    }, "getQuota");
  };

  // get name details
  public getNameDetails = (name: string): Promise<any> => {
    return executeWithLogging(async () => {
      const isAvailable = await this.available(name).catch(() => false);
      // console.log('getNameDetails =========== isAvailable',isAvailable)
      if (isAvailable) {
        return {
          name: "ICP",
          available: true,
          registrant: "Not owner",
          controller: "Not owner",
          resolver: "No Resolver set",
          expireAt: "No Expire set",
        };
      } else {
        const values = await Promise.all([
          this.getRegistrationDetailsOfName(name),
          this.getRegistryDetailsOfName(name),
        ]);
        return {
          name: name,
          available: false,
          registrant: values[0].owner.toText(),
          controller: values[1].owner.toText(),
          resolver: values[1].resolver.toText(),
          expireAt: new Date(Number(values[0].expired_at)),
        };
      }
    }, "getNameDetails");
  };

  // get favorite names
  public getFavoriteNames = (): Promise<Array<string>> => {
    return executeWithLogging(async () => {
      const res: any = await this.favoritesActor?.get_favorites();
      console.log('favoritesActor.get_favorites', res)
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "getFavoriteNames");
  };

  // add favorite name
  public addFavoriteName = (name: string): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res: any = await this.favoritesActor?.add_favorite(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "addFavoriteName");
  };

  // remove favorite name
  public removeFavoriteName = (name: string): Promise<boolean> => {
    return executeWithLogging(async () => {
      const res: any = await this.favoritesActor?.remove_favorite(name);
      if ("Ok" in res) {
        return res.Ok;
      } else {
        throw new CanisterError(res.Err);
      }
    }, "removeFavoriteName");
  };
}

