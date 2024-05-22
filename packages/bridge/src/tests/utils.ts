import { ethers } from 'ethers';
import { Actor, HttpAgent } from '@dfinity/agent';
import { exec } from 'child_process';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import {
  CHAIN_ID,
  IC_HOST,
  ICRC2_TOKEN_CANISTER_ID,
  RPC_URL
} from '../constants';
import { fromHexString } from '@dfinity/candid';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';

export const createAgent = (key: string) => {
  const identity = Secp256k1KeyIdentity.fromSecretKey(
    fromHexString(key.replace(/^0x/, ''))
  );

  const agent = new HttpAgent({
    host: IC_HOST,
    identity
  });

  agent.fetchRootKey();

  return { agent, identity };
};

export const generateOperationId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 0x100000000);
  const uniqueId = (timestamp + randomNum) % 0x100000000;
  return uniqueId;
};

export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL, {
    name: 'Bitfinity',
    chainId: Number(CHAIN_ID)
  });
};

export const randomWallet = () => {
  const wallet = ethers.Wallet.createRandom();

  const provider = getProvider();

  return wallet.connect(provider);
};

export const getContract = (address: string, abi: any) => {
  const provider = getProvider();
  const contract = new ethers.Contract(address, abi, provider);
  return contract;
};

export const execCmd = (cmd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        return reject(err);
      } else if (stdout) {
        resolve(stdout);
      }
    });
  });
};

export const execBitcoinCmd = (cmd: string) => {
  return execCmd(`${process.env.BITCOIN_CMD} ${cmd}`);
};

export const execOrdCmd = (cmd: string) => {
  return execCmd(`${process.env.ORD_CMD} ${cmd}`);
};

export const execOrdSend = async (address: string, runeName: string) => {
  try {
    const response = await execOrdCmd(
      `wallet --server-url http://0.0.0.0:8000 send --fee-rate 10 ${address} 10:${runeName}`
    );

    const result = JSON.parse(response);

    return result.txid;
  } catch (_) {
    return null;
  }
};

export const execOrdReceive = async () => {
  try {
    const response = await execOrdCmd(
      `wallet --server-url http://0.0.0.0:8000 receive`
    );

    const result = JSON.parse(response);

    return result.addresses[0];
  } catch (_) {
    return null;
  }
};

export const execSendIcrcToken = async (principal: string, amount: number) => {
  return await execCmd(
    `dfx canister call ${ICRC2_TOKEN_CANISTER_ID} icrc1_transfer '(record {to=record {owner = principal "${principal}"; }; fee=null; memo=null; from_subaccount=null; created_at_time=null; amount=${amount}})' --network ${IC_HOST}`
  );
};

export async function mintNativeToken(toAddress: string, amount: string) {
  const response = await fetch(process.env.RPC_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: '67',
      method: 'ic_mintNativeToken',
      params: [toAddress, amount]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const createBitfinityWallet = (agent: HttpAgent) => {
  return {
    async requestConnect(args) {
      return {};
    },
    async createActor(args) {
      return Actor.createActor(args.interfaceFactory, {
        agent,
        canisterId: args.canisterId
      });
    },
    async batchTransactions(transactions) {
      for (const tr of transactions) {
        const actor: any = await this.createActor({
          canisterId: tr.canisterId,
          interfaceFactory: tr.idl
        });

        try {
          const result = await actor[tr.methodName](...tr.args);
          await tr.onSuccess(result);
        } catch (err) {
          await tr.onFail(err);
        }
      }

      return true;
    }
  } as BitfinityWallet;
};
