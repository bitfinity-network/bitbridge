import { Buffer } from 'buffer';
import { HttpAgent } from '@dfinity/agent';
import { fromHexString } from '@dfinity/candid';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { IC_HOST } from './constants';

export const ethAddrToSubaccount = (ethAddr: string) => {
  ethAddr = ethAddr.replace(/^0x/, '');

  const buffer = fromHexString(ethAddr);

  const acc = new Uint8Array(32);

  acc.set(new Uint8Array(buffer), 0);

  return acc;
};

export const encodeBtcAddress = (address: string) => {
  return Buffer.from(address, 'utf8').toString('hex');
};

export const isBrowser = () => {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
};

export const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createAgent = (
  host = IC_HOST,
  key: string | undefined = undefined
) => {
  const identity = key
    ? Secp256k1KeyIdentity.fromSecretKey(fromHexString(key.replace(/^0x/, '')))
    : undefined;

  const agent = new HttpAgent({
    host,
    identity
  });

  return { agent, identity };
};
