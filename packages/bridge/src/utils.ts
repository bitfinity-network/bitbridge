import { Buffer } from 'buffer';
import { fromHexString,  } from '@dfinity/candid';

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

export const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

