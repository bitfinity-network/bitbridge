import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import * as ethers from 'ethers';

import { BtcActor } from './ic';
import { BFT_ETH_ADDRESS, BTC_TOKEN_WRAPPED_ADDRESS } from './constants';
import { encodeBtcAddress, ethAddrToSubaccount } from './utils';
import WrappedTokenABI from './abi/WrappedToken';
import BFTBridgeABI from './abi/BFTBridge';
import { wait } from './utils';

import { EthAddress } from './validation';

interface BtcBridgeOptions {
  wallet: ethers.Signer;
  bftAddress?: EthAddress;
  wrappedTokenAddress?: EthAddress;
  btcBridgeCanisterId?: string;
  btcActor?: typeof BtcActor;
}

export class BtcBridge {
  protected wallet: ethers.Signer;
  protected bftAddress: EthAddress;
  protected btcActor: typeof BtcActor;
  public wrappedTokenAddress: string;

  constructor({
    wallet,
    bftAddress,
    wrappedTokenAddress,
    btcActor
  }: BtcBridgeOptions) {
    this.wallet = wallet;
    this.bftAddress = bftAddress || BFT_ETH_ADDRESS;
    this.wrappedTokenAddress = wrappedTokenAddress || BTC_TOKEN_WRAPPED_ADDRESS;
    this.btcActor = btcActor || BtcActor;
  }

  getWrappedTokenContract() {
    return new ethers.Contract(
      this.wrappedTokenAddress,
      WrappedTokenABI,
      this.wallet
    );
  }

  getBftBridgeContract() {
    return new ethers.Contract(this.bftAddress, BFTBridgeABI, this.wallet);
  }

  async getWrappedTokenBalance(address: EthAddress) {
    const wrappedTokenContract = this.getWrappedTokenContract();

    return await wrappedTokenContract.balanceOf(address);
  }

  async getBTCAddress(address: EthAddress) {
    const btcAddress = await this.btcActor.get_btc_address({
      owner: [Principal.fromText(Actor.canisterIdOf(this.btcActor).toText())],
      subaccount: [ethAddrToSubaccount(address)]
    });

    return btcAddress;
  }

  /**
   * After you sent the BTC to the address returned
   * by getBTCAddress, this function will bridge
   * the tokens to EVM.
   *
   * @param address
   */
  async bridgeBtc(address: EthAddress) {
    return await this.btcActor.btc_to_erc20(address);
  }


  async bridgeEVMc(address: string, satoshis: number) {
    const wrappedTokenContract = this.getWrappedTokenContract();

    const approveTx = await wrappedTokenContract.approve(
      this.bftAddress,
      satoshis
    );
    await approveTx.wait(2);

    await wait(10000);

    const bftBridgeContract = this.getBftBridgeContract();

    const burnTx = await bftBridgeContract.burn(
      satoshis,
      this.wrappedTokenAddress,
      `0x${encodeBtcAddress(address)}`
    );

    await burnTx.wait(2);
  }
}
