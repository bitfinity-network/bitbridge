import { Principal } from '@dfinity/principal';
import { Buffer } from 'node:buffer';

export class PrincipalFactory {
  static hexToPrincipal(hexString: string): Principal {
    const cleanHexString = hexString.replace('0x', '');
    const buf = Buffer.from(cleanHexString, 'hex');
    const length = buf.readUInt8(1);
    const principalData = Buffer.alloc(length);
    buf.copy(principalData, 0, 2, 2 + length);

    return Principal.fromUint8Array(Uint8Array.from(principalData));
  }

  static principalToBytes32(principal: Principal): Uint8Array {
    const oldBuffer = principal.toUint8Array();

    const newBuffer = new ArrayBuffer(32);
    const buf = new Uint8Array(newBuffer);
    buf[0] = oldBuffer.length;
    buf.set(oldBuffer, 1);

    return buf;
  }

  static principalToBytes(principal: Principal): Uint8Array {
    const oldBuffer = principal.toUint8Array();
    const newBuffer = new ArrayBuffer(oldBuffer.length + 1);
    const buf = new Uint8Array(newBuffer);
    buf[0] = oldBuffer.length;
    buf.set(oldBuffer, 1);

    return buf;
  }
}
