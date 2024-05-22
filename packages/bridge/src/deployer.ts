import * as ethers from 'ethers';
import BftBridgeABI from './abi/BFTBridge';
import { Address, Id256, Id256Factory } from '@bitfinity-network/id256';
import { Principal } from '@dfinity/principal';

export interface DeployerOptions {
  wallet: ethers.Signer;
  bftAddress: string;
}

export class Deployer {
  protected bftBridge: ethers.Contract;
  protected wallet: ethers.Signer;

  constructor({ bftAddress, wallet }: DeployerOptions) {
    this.wallet = wallet;
    this.bftBridge = this.getBftBridgeContract(bftAddress);
  }

  protected getBftBridgeContract(address: string) {
    return new ethers.Contract(address, BftBridgeABI, this.wallet);
  }

  protected idFromCanister(baseTokenCanisterId: string): Id256 {
    return Id256Factory.fromPrincipal(Principal.fromText(baseTokenCanisterId));
  }

  protected idFromRune(runeId: string) {
    const [b, t] = runeId.split(':');
    return Id256Factory.fromBtcTxIndex(BigInt(b), parseInt(t, 10));
  }

  async deployIcrcWrappedToken(
    baseTokenCanisterId: string,
    name: string,
    symbol: string
  ): Promise<string> {
    let wrappedTokenAddress =
      await this.getWrappedTokenAddress(baseTokenCanisterId);

    if (wrappedTokenAddress && new Address(wrappedTokenAddress).isZero()) {
      const id256 = this.idFromCanister(baseTokenCanisterId);
      const tx = await this.bftBridge.deployERC20(name, symbol, id256);
      wrappedTokenAddress = await tx.wait(2);
    }

    return wrappedTokenAddress;
  }

  async deployRuneWrappedToken(runeId: string, name: string): Promise<string> {
    let wrappedTokenAddress = await this.getWrappedTokenAddress(runeId);

    if (wrappedTokenAddress && new Address(wrappedTokenAddress).isZero()) {
      const id256 = this.idFromRune(runeId);
      const tx = await this.bftBridge.deployERC20(name, name, id256);
      wrappedTokenAddress = await tx.wait(2);
    }

    return wrappedTokenAddress;
  }

  async getWrappedTokenAddress(id: string): Promise<string> {
    return await this.bftBridge.getWrappedToken(
      id.includes(':') ? this.idFromRune(id) : this.idFromCanister(id)
    );
  }
}
