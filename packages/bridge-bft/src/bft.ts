import { Buffer } from 'buffer';
import * as ethers from 'ethers';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { Address, Id256, Id256Factory } from '@bitfinity-network/id256';

import BftBridgeABI from './abi/BFTBridge';

export interface BftOptions {
  address: string;
  wallet: ethers.Signer;
}

export class Bft {
  protected eth: {
    bft?: ethers.Contract;
    feeCharge?: ethers.Contract;
  } = {};
  protected wallet: ethers.Signer;
  protected address: string;

  constructor({ address, wallet }: BftOptions) {
    this.address = address;
    this.wallet = wallet;
  }

  protected get bftBridge() {
    if (!this.eth.bft) {
      this.eth.bft = new ethers.Contract(
        this.address,
        BftBridgeABI,
        this.wallet
      );
    }

    return this.eth.bft;
  }

  protected idFromCanister(baseTokenCanisterId: string): Id256 {
    return Id256Factory.fromPrincipal(Principal.fromText(baseTokenCanisterId));
  }

  protected idFromRune(runeId: string) {
    const [b, t] = runeId.split(':');
    return Id256Factory.fromBtcTxIndex(BigInt(b), parseInt(t, 10));
  }

  protected async getTokensPairs(): Promise<{ eth: string; id256: string }[]> {
    const pairs = await this.bftBridge.listTokenPairs();

    if (!(pairs && pairs.length > 1)) {
      return [];
    }

    return pairs[0].map((eth: string, index: number) => {
      return {
        eth,
        id256: pairs[1][index]
      };
    });
  }

  async getIcrcTokensPairs(): Promise<{ wrapped: string; base: string }[]> {
    const pairs = await this.getTokensPairs();

    return pairs.map(({ eth, id256 }) => {
      return {
        wrapped: eth,
        base: Id256Factory.toPrincipal(
          Buffer.from(id256.replace(/^0x/, ''), 'hex')
        ).toText()
      };
    });
  }

  async getBtcTokensPairs(): Promise<{ wrapped: string; base: string }[]> {
    const pairs = await this.getTokensPairs();

    return pairs.map(({ eth, id256 }) => {
      const [b, t] = Id256Factory.toBtcTxIndex(
        Buffer.from(id256.replace(/^0x/, ''), 'hex')
      );

      return {
        wrapped: eth,
        base: `${b}:${t}`
      };
    });
  }

  async getRuneTokensPairs(): Promise<{ wrapped: string; base: string }[]> {
    const pairs = await this.getTokensPairs();

    return pairs.map(({ eth, id256 }) => {
      const [b, t] = Id256Factory.toBtcTxIndex(
        Buffer.from(id256.replace(/^0x/, ''), 'hex')
      );

      return {
        wrapped: eth,
        base: `${b}:${t}`
      };
    });
  }

  async deployIcrcWrappedToken(
    baseTokenCanisterId: string,
    name: string,
    symbol: string
  ): Promise<string> {
    const wrappedTokenAddress =
      await this.getWrappedTokenAddress(baseTokenCanisterId);

    if (wrappedTokenAddress && new Address(wrappedTokenAddress).isZero()) {
      const id256 = this.idFromCanister(baseTokenCanisterId);
      const tx = await this.bftBridge.deployERC20(name, symbol, id256);
      await tx.wait(2);
    }

    return await this.getWrappedTokenAddress(baseTokenCanisterId);
  }

  async deployRuneWrappedToken(runeId: string, name: string): Promise<string> {
    const wrappedTokenAddress = await this.getWrappedTokenAddress(runeId);

    if (wrappedTokenAddress && new Address(wrappedTokenAddress).isZero()) {
      const id256 = this.idFromRune(runeId);

      const tx = await this.bftBridge.deployERC20(name, name, id256);
      await tx.wait(2);
    }

    return await this.getWrappedTokenAddress(runeId);
  }

  async getWrappedTokenAddress(wrapped: string): Promise<string> {
    return await this.bftBridge.getWrappedToken(
      wrapped.includes(':')
        ? this.idFromRune(wrapped)
        : this.idFromCanister(wrapped)
    );
  }

  async burnIcrc(
    owner: string,
    token: string,
    recipient: string,
    amount: bigint
  ) {
    const Icrc2Burn = IDL.Record({
      sender: IDL.Principal,
      amount: IDL.Text,
      icrc2_token_principal: IDL.Principal,
      from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
      recipient_address: IDL.Text, // IDL.Vec(IDL.Nat8),
      fee_payer: IDL.Opt(IDL.Text)
    });

    const encoded = IDL.encode(
      [Icrc2Burn],
      [
        {
          sender: Principal.fromText(owner),
          from_subaccount: [],
          amount: `0x${BigInt(amount).toString(16)}`,
          icrc2_token_principal: Principal.fromText(token),
          recipient_address: recipient,
          fee_payer: [recipient]
        }
      ]
    );

    const tx = await this.bftBridge.notifyMinter(0, encoded);
    await tx.wait(2);
  }

  async burn(recipient: string, tokenAddress: string, amount: bigint) {
    let send;

    try {
      Principal.fromText(recipient);
      send = Id256Factory.fromPrincipal(Principal.fromText(recipient));
    } catch (_) {
      /* empty */
    }

    if (!send) {
      send = `0x${Buffer.from(recipient, 'utf8').toString('hex')}`;
    }

    const tx = await this.bftBridge.burn(amount, tokenAddress, send);
    await tx.wait(2);

    return tx;
  }
}
