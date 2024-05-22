import { Principal } from '@dfinity/principal';
import { Buffer } from 'node:buffer';

import { Id256 } from './id256';
import { AddressWithChainID } from './address';

export class Id256Factory {
  static PRINCIPAL_MARK = 0;
  static EVM_ADDRESS_MARK = 1;

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

  static fromPrincipal(principal: Principal): Id256 {
    const buf = Buffer.alloc(32);
    buf[0] = Id256Factory.PRINCIPAL_MARK;

    const principalData = principal.toUint8Array();
    buf[1] = principalData.length;
    const prinBuffer = Buffer.from(principalData);
    buf.set(prinBuffer, 2);

    return buf;
  }

  // static hexToPrincipal(hexString: string): Principal {
  //   const cleanHexString = hexString.replace('0x', '');
  //   const buf = Buffer.from(cleanHexString, 'hex');
  //   const length = buf.readUInt8(1);
  //   const principalData = Buffer.alloc(length);
  //   buf.copy(principalData, 0, 2, 2 + length);
  //
  //   return Principal.fromUint8Array(Uint8Array.from(principalData));
  // }
  //
  // static principalToBytes32(principal: Principal): Uint8Array {
  //   const oldBuffer = principal.toUint8Array();
  //
  //   const newBuffer = new ArrayBuffer(32);
  //   const buf = new Uint8Array(newBuffer);
  //   buf[0] = oldBuffer.length;
  //   buf.set(oldBuffer, 1);
  //
  //   return buf;
  // }
  //
  // static principalToBytes(principal: Principal): Uint8Array {
  //   const oldBuffer = principal.toUint8Array();
  //   const newBuffer = new ArrayBuffer(oldBuffer.length + 1);
  //   const buf = new Uint8Array(newBuffer);
  //   buf[0] = oldBuffer.length;
  //   buf.set(oldBuffer, 1);
  //
  //   return buf;
  // }

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
