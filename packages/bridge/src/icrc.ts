import { Principal } from '@dfinity/principal';
import { Wallets } from '@bitfinity-network/bridge-bft';

import {
  Bridge,
  BridgeFromEvmc,
  BridgeToEvmc,
  DeployWrappedToken
} from './bridge';
import { Icrc1IdlFactory, ICRC1, ICRC2Minter } from './ic';
import { ethAddrToSubaccount } from './utils';
import { Networks } from './network';

export interface IcrcBridgeOptions {
  wallets: Wallets;
  network: string;
  networks: Networks;
}

export class IcrcBridge implements Bridge {
  protected ic: {
    baseToken?: Promise<ICRC1>;
    iCRC2Minter?: Promise<ICRC2Minter>;
  } = {};
  protected wallets: Wallets;
  protected networkName: string;
  protected networks: Networks;

  constructor({ network, networks, wallets }: IcrcBridgeOptions) {
    this.networkName = network;
    this.networks = networks;
    this.wallets = wallets;
  }

  protected get network() {
    return this.networks.getBridge(this.networkName, 'icrc_evm');
  }

  protected get bftBridge() {
    return this.wallets.getBft(this.network.bftAddress);
  }

  protected get feeCharge() {
    return this.wallets.getFeeCharge(this.network.feeChargeAddress);
  }

  async getTokensPairs() {
    return await this.bftBridge.getIcrcTokensPairs();
  }

  async getWrappedTokenAddress(wrapped: string) {
    return await this.bftBridge.getWrappedTokenAddress(wrapped);
  }

  async deployWrappedToken({ id, name, symbol, decimals }: DeployWrappedToken) {
    return await this.bftBridge.deployIcrcWrappedToken(
      id,
      name,
      symbol,
      decimals
    );
  }

  baseToken(token: string) {
    return this.wallets.getWalletActor<ICRC1>(token, Icrc1IdlFactory);
  }

  async getBaseTokenBalance(base: string, address: string) {
    const actor = await this.baseToken(base);

    return actor.icrc1_balance_of({
      owner: Principal.fromText(address),
      subaccount: []
    });
  }

  async getWrappedTokenInfo(wrapped: string) {
    return await this.wallets.getWrappedTokenInfo(wrapped);
  }

  async getWrappedTokenBalance(
    wrapped: string,
    address: string
  ): Promise<bigint> {
    return await this.wallets.getWrappedTokenBalance(wrapped, address);
  }

  icWhitelist() {
    return [this.network.iCRC2MinterCanisterId];
  }

  async bridgeToEvmc({ token, owner, recipient, amount }: BridgeToEvmc) {
    await this.feeCharge.checkAndDeposit(owner, recipient);

    const baseTokenActor = await this.baseToken(token);

    const fee = await baseTokenActor.icrc1_fee();

    await baseTokenActor.icrc2_approve({
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      amount: amount + fee * 2n,
      expected_allowance: [],
      expires_at: [],
      spender: {
        owner: Principal.fromText(this.network.iCRC2MinterCanisterId),
        subaccount: [ethAddrToSubaccount(recipient)]
      }
    });

    await this.bftBridge.burnIcrc(owner, token, recipient, amount);
  }

  async bridgeFromEvmc({ wrappedToken, recipient, amount }: BridgeFromEvmc) {
    const wrappedTokenContract =
      this.wallets.getWrappedTokenContract(wrappedToken);

    const apTx = await wrappedTokenContract.approve(
      this.network.bftAddress,
      amount
    );
    await apTx.wait(2);

    await this.bftBridge.burn(recipient, wrappedToken, amount);
  }
}
