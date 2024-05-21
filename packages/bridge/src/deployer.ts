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

  protected baseTokenId256(baseTokenCanisterId: string): Id256 {
    return Id256Factory.fromPrincipal(Principal.fromText(baseTokenCanisterId));
  }

  async deployBftWrappedToken(
    baseTokenCanisterId: string,
    name: string,
    symbol: string
  ): Promise<string> {
    const id256 = this.baseTokenId256(baseTokenCanisterId);

    let wrappedTokenAddress = await this.bftBridge.getWrappedToken(id256);

    if (wrappedTokenAddress && new Address(wrappedTokenAddress).isZero()) {
      const tx = await this.bftBridge.deployERC20(name, symbol, id256);
      wrappedTokenAddress = await tx.wait(2);
    }

    return wrappedTokenAddress;
  }

  async getWrappedTokenAddress(baseTokenCanisterId: string): Promise<string> {
    const wrappedTokenAddress = await this.bftBridge.getWrappedToken(
      this.baseTokenId256(baseTokenCanisterId)
    );

    if (new Address(wrappedTokenAddress).isZero()) {
      throw new Error('Invalid Address');
    }

    return wrappedTokenAddress;
  }
}
