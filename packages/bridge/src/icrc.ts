import { Principal } from '@dfinity/principal';
import * as ethers from 'ethers';
import { numberToHex } from 'viem';
import { Id256Factory } from '@bitfinity-network/id256';
import {
  BitfinityWallet,
  Transaction
} from '@bitfinity-network/bitfinitywallet';
import type { Agent } from '@dfinity/agent';

import { Bridge } from './bridge';
import {
  Icrc1IdlFactory,
  Icrc2MinterIdlFactory,
  ICRC1,
  ICRC2Minter
} from './ic';
import { BridgeToken, idStrMatch } from './tokens';
import { generateOperationId } from './tests/utils';
import BftBridgeABI from './abi/BFTBridge';
import WrappedTokenABI from './abi/WrappedToken';

export interface IcrcBridgeOptions {
  agent: Agent;
  wallet: ethers.Signer;
  bitfinityWallet: BitfinityWallet;
  bftAddress: string;
  iCRC2MinterCanisterId: string;
  baseTokenCanisterId: string;
  wrappedTokenAddress: string;
}

export class IcrcBridge implements Bridge {
  protected bridgeId: string;
  protected bftBridge: ethers.Contract;
  protected wallet: ethers.Signer;
  protected bitfinityWallet: BitfinityWallet;
  protected agent: Agent;
  protected iCRC2MinterCanisterId: string;
  protected baseTokenCanisterId: string;
  protected wrappedTokenAddress: string;
  protected walletActors: {
    baseToken?: typeof ICRC1;
    iCRC2Minter?: typeof ICRC2Minter;
  } = {};

  constructor({
    bftAddress,
    wallet,
    bitfinityWallet,
    agent,
    iCRC2MinterCanisterId,
    baseTokenCanisterId,
    wrappedTokenAddress
  }: IcrcBridgeOptions) {
    this.bridgeId = `${baseTokenCanisterId}`;
    this.wallet = wallet;
    this.bitfinityWallet = bitfinityWallet || window.ic.bitfinityWallet;
    this.bftBridge = this.getBftBridgeContract(bftAddress);
    this.iCRC2MinterCanisterId = iCRC2MinterCanisterId;
    this.baseTokenCanisterId = baseTokenCanisterId;
    this.wrappedTokenAddress = wrappedTokenAddress;
    this.agent = agent;
  }

  idMatch(token: BridgeToken) {
    return idStrMatch(this.wrappedTokenAddress, token);
  }

  protected async initICRC2Minter() {
    if (this.walletActors.iCRC2Minter) {
      return this.walletActors.iCRC2Minter;
    }

    this.walletActors.iCRC2Minter = await this.bitfinityWallet.createActor<
      typeof ICRC2Minter
    >({
      canisterId: this.iCRC2MinterCanisterId,
      interfaceFactory: Icrc2MinterIdlFactory
    });
  }

  protected async initBaseToken() {
    if (this.walletActors.baseToken) {
      return this.walletActors.baseToken;
    }

    this.walletActors.baseToken = await this.bitfinityWallet.createActor<
      typeof ICRC1
    >({
      canisterId: this.baseTokenCanisterId,
      interfaceFactory: Icrc1IdlFactory
    });
  }

  get icrc2Minter() {
    if (!this.walletActors.iCRC2Minter) {
      throw new Error('Wallet actors not init yet. Call init() before');
    }

    return this.walletActors.iCRC2Minter;
  }

  get baseToken() {
    if (!this.walletActors.baseToken) {
      throw new Error(
        'Wallet actors not init yet. Call initWalletActors() before'
      );
    }

    return this.walletActors.baseToken;
  }

  public async init() {
    await this.initICRC2Minter();
    await this.initBaseToken();
  }

  protected getBftBridgeContract(address: string) {
    return new ethers.Contract(address, BftBridgeABI, this.wallet);
  }

  get baseTokenId() {
    return Principal.fromText(this.baseTokenCanisterId);
  }

  get icrc2MinterId() {
    return Principal.fromText(this.iCRC2MinterCanisterId);
  }

  async getWrappedTokenContract() {
    return new ethers.Contract(
      this.wrappedTokenAddress,
      WrappedTokenABI,
      this.wallet
    );
  }

  async getBaseTokenBalance(principal: string) {
    return this.baseToken.icrc1_balance_of({
      owner: Principal.fromText(principal),
      subaccount: []
    });
  }

  async getWrappedTokenBalance(address: string) {
    const wrappedTokenContract = await this.getWrappedTokenContract();

    return await wrappedTokenContract.balanceOf(address);
  }

  async icWhitelist() {
    return [this.baseTokenCanisterId, this.iCRC2MinterCanisterId];
  }

  async bridgeToEvmc(amount: bigint, recipient: string) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const fee = await this.baseToken.icrc1_fee();

          const trRes: unknown[] = [];
          const trErr: unknown[] = [];

          const bridgeTransactions: Transaction[] = [
            {
              idl: Icrc1IdlFactory,
              canisterId: this.baseTokenCanisterId,
              methodName: 'icrc2_approve',
              args: [
                {
                  fee: [],
                  memo: [],
                  from_subaccount: [],
                  created_at_time: [],
                  amount: amount + fee * 2n,
                  expected_allowance: [],
                  expires_at: [],
                  spender: {
                    owner: this.icrc2MinterId,
                    subaccount: []
                  }
                }
              ],
              onSuccess: async (res) => {
                trRes.push(res);
              },
              onFail: async (err) => {
                trErr.push(err);
              }
            },
            {
              idl: Icrc2MinterIdlFactory,
              canisterId: this.iCRC2MinterCanisterId,
              methodName: 'burn_icrc2',
              args: [
                {
                  operation_id: generateOperationId(),
                  from_subaccount: [],
                  icrc2_token_principal: this.baseTokenId,
                  recipient_address: recipient,
                  amount: numberToHex(amount)
                }
              ],
              onSuccess: async (res: any) => {
                trRes.push(res);
              },
              onFail: async (err: any) => {
                trErr.push(err);
              }
            }
          ];

          await this.bitfinityWallet.batchTransactions(bridgeTransactions);

          if (trErr.length) {
            reject(trErr);
          } else {
            resolve(trRes);
          }
        } catch (err) {
          reject(err);
        }
      })();
    });
  }

  async bridgeFromEvmc(recipient: string, amount: bigint) {
    const wrappedToken = await this.getWrappedTokenContract();

    const apTx = await wrappedToken.approve(
      await this.bftBridge.getAddress(),
      amount
    );

    await apTx.wait(2);

    const wrappedTokenAddress = await wrappedToken.getAddress();

    const tx = await this.bftBridge.burn(
      amount,
      wrappedTokenAddress,
      Id256Factory.fromPrincipal(Principal.fromText(recipient))
    );

    await tx.wait(2);
  }
}
