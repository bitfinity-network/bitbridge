import { Principal } from '@dfinity/principal';
import { Buffer } from 'node:buffer';

import { Id256 } from './id256';
import { AddressWithChainID } from './address';

export class Id256Factory {
  static PRINCIPAL_MARK = 0;
  static EVM_ADDRESS_MARK = 1;
  static BTC_TX_MARK = 2;

  static chainIdFromId256(buffer: Id256): number {
    if (buffer.readUIntBE(0, 1) !== Id256Factory.EVM_ADDRESS_MARK) {
      return 0;
    }
    return buffer.readUInt32BE(1);
  }

  static toPrincipal(id: Id256): Principal {
    if (id[0] !== Id256Factory.PRINCIPAL_MARK) {
      throw Error('Wrong principal mark in Id256');
    }

    return Principal.fromUint8Array(id.slice(2, 2 + id[1]));
  }

  static toEvmAddress(id: Id256): [number, string] {
    if (id[0] !== Id256Factory.EVM_ADDRESS_MARK) {
      throw Error('Wrong evm address mark in Id256');
    }

    if (id.slice(1, 5).byteLength !== 4) {
      throw new Error('Unexpected chain id length, must be 4 bytes');
    }

    return [
      id.slice(1, 5).readUInt32BE(),
      `0x${id.slice(5, 25).toString('hex')}`
    ];
  }

  static toBtcTxIndex(id: Id256): [bigint, number]
  {
    if (id[0] !== Id256Factory.BTC_TX_MARK) {
      throw Error('Wrong rune id mark in Id256');
    }

    if (id.slice(1, 9).byteLength !== 8) {
      throw new Error('Unexpected tx id length, must be 8 bytes');
    }

    return [
      id.slice(1, 9).readBigInt64BE(),
      id.slice(9, 14).readUInt32BE(),
    ];
  }

  static fromPrincipal(principal: Principal): Id256 {
    const buf = Buffer.alloc(32);
    buf[0] = Id256Factory.PRINCIPAL_MARK;

    const principalData = principal.toUint8Array();
    buf[1] = principalData.length;
    const prinBuffer = Buffer.from(principalData);
    buf.set(prinBuffer, 2);

    return buf;
  }

  static fromBtcTxIndex(blockId: bigint, txId: number): Id256 {
    const buf = Buffer.alloc(32);

    buf[0] = Id256Factory.BTC_TX_MARK;

    const blockIdBuf = Buffer.alloc(8);
    blockIdBuf.writeBigUInt64BE(blockId);
    blockIdBuf.copy(buf, 1, 0, 8);

    const txIdBuf = Buffer.alloc(4);
    txIdBuf.writeUInt32BE(txId);
    txIdBuf.copy(buf, 9, 0, 4);

    return buf;
  }

  static fromAddress(input: AddressWithChainID): Id256 {
    const buf = Buffer.alloc(32); // Create a buffer with 32 bytes
    // Set the first byte to EVM_ADDRESS_MARK
    buf[0] = Id256Factory.EVM_ADDRESS_MARK;

    // Convert the chainId to big-endian and add it to the buffer
    const chainIdBuf = Buffer.alloc(4);
    chainIdBuf.writeUInt32BE(Number(input.getChainID()));
    chainIdBuf.copy(buf, 1, 0, 4);

    // Convert the address to bytes and add it to the buffer
    const addressBuf = input.addressAsBuffer();
    addressBuf.copy(buf, 5);

    return buf;
  }

  static from(input: AddressWithChainID | Principal): Id256 {
    if (input instanceof AddressWithChainID) {
      return this.fromAddress(input as AddressWithChainID);
    } else {
      return this.fromPrincipal(input as Principal);
    }
  }
}
