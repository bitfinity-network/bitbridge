import { expect, test } from 'vitest';
import { generateWallet, identityFromSeed, wait } from './utils';
import { IcrcBridge } from '../icrc';
import { LOCAL_TEST_SEED_PHRASE } from '../constants';
import { createAgent } from '../utils';

(BigInt as any).prototype.toJSON = function () {
  return this.toString();
};

test('bridge icrc2 token to evm', async () => {
  const identity = await identityFromSeed(LOCAL_TEST_SEED_PHRASE);

  const wallet = generateWallet();

  const agent = createAgent({ identity });

  const icrcBricdge = await IcrcBridge.create({
    wallet,
    agent
  });

  await icrcBricdge.deployBftWrappedToken('AUX', 'AUX');

  await wait(5000);

  const wrappedToken = await icrcBricdge.getWrappedTokenContract();

  let balance = await wrappedToken.balanceOf(wallet.address);

  console.log('ibalance', balance);

  const amount = 100000n;

  console.log('wallet.address', wallet.address);

  await icrcBricdge.bridgeIcrc2ToEmvc(amount, wallet.address);

  await wait(10000);

  // const wrappedToken = await icrcBricdge.getWrappedTokenContract();

  balance = await wrappedToken.balanceOf(wallet.address);

  console.log('out', { balance, amount });

  expect(balance).toBeGreaterThan(0n);
}, 30000);

test('bridge evmc tokens to icrc2', async () => {
  const amount = 1000n;

  const wallet = generateWallet();

  const identity = await identityFromSeed(LOCAL_TEST_SEED_PHRASE);

  const agent = createAgent({ identity });

  const icrcBricdge = await IcrcBridge.create({
    wallet,
    agent
  });

  const identity = identityFromSeed(LOCAL_TEST_SEED_PHRASE);
  const userPrincipal = (await identity).getPrincipal();

  const initialBalance = await icrcBricdge.baseToken.icrc1_balance_of({
    owner: userPrincipal,
    subaccount: []
  });

  await icrcBricdge.bridgeEmvcToIcrc2(amount, userPrincipal);

  const finalBalance = await icrcBricdge.baseToken.icrc1_balance_of({
    owner: (await identity).getPrincipal(),
    subaccount: []
  });

  expect(finalBalance).toBeGreaterThan(initialBalance);
}, 15000);
