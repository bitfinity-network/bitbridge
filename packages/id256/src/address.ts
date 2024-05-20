import { isAddress } from 'web3-validator';

import { Id256 } from './id256';

export class Address {
  private address: string;

  public getAddress(): string {
    return this.address;
  }

  public addressAsBuffer(): Id256 {
    return Buffer.from(this.address.replace('0x', ''), 'hex');
  }

  public isZero(): boolean {
    return parseInt(this.address, 16) === 0;
  }

  constructor(address: string) {
    if (!isAddress(address)) {
      throw Error('Not a valid address');
    }

    this.address = address;
  }
}

export class AddressWithChainID extends Address {
  private chainID: number;

  public getChainID(): number {
    return this.chainID;
  }

  constructor(address: string, chainID: number) {
    super(address);
    this.chainID = chainID;
  }
}
