import { Buffer } from 'buffer';
import { IC_HOST } from './constants';
import { HttpAgent } from '@dfinity/agent';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';

export const fromHexString = (hexString: string) =>
  Uint8Array.from(
    hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

export const ethAddrToSubaccount = (ethAddr: string) => {
  ethAddr = ethAddr.replace(/^0x/, '');

  const hex = fromHexString(ethAddr);

  const y = [];
  for (const i of hex) {
    y.push(i);
  }

  while (y.length !== 32) {
    y.push(0);
  }

  return Uint8Array.from(y);
};

export const encodeBtcAddress = (address: string) => {
  return Buffer.from(address, 'utf8').toString('hex');
};

export const isBrowser = () => {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
};
export const createAgent = ({
  host = IC_HOST,
  identity = undefined
}: {
  host?: string;
  identity?: Secp256k1KeyIdentity;
}) => {
  const agent = new HttpAgent({
    host,
    identity
  });

  return agent;
};
