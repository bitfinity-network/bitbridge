import { describe, expect, test } from 'vitest';

import { Connector, IcrcBridge } from '..';
import {
  createAgent,
  createBitfinityWallet,
  mintNativeToken,
  randomWallet
} from './utils';
import { defaultDeployedTokens } from '../tokens-urls';
import { BridgeIcrcToken } from '../tokens';

const deployedTokensCount = defaultDeployedTokens.length;

describe('connector', async () => {
  const wallet = randomWallet();

  const { agent } = createAgent(wallet.privateKey);
  const bitfinityWallet = createBitfinityWallet(agent);

  await mintNativeToken(wallet.address, '10000000000000000');

  test('create', async () => {
    const connector = Connector.create({ wallet, bitfinityWallet });

    expect(connector.getBridgedTokens()).toHaveLength(0);
  });

  test('fetch local', async () => {
    const connector = Connector.create({ wallet, bitfinityWallet });

    const fetchedCount = await connector.fetchLocal();

    expect(fetchedCount).toStrictEqual(deployedTokensCount);
  });

  test('bridge local without deploy', async () => {
    const connector = Connector.create({ wallet, bitfinityWallet });

    await connector.fetchLocal();

    const bridgedCount = connector.bridge();

    expect(bridgedCount).toStrictEqual(1);
    expect(connector.getBridgedTokens()).toHaveLength(1);
  });

  test('bridge after deploy', async () => {
    const connector = Connector.create({ wallet, bitfinityWallet });

    await connector.fetchLocal();

    const bridgedCount = await connector.bridgeAfterDeploy();

    expect(bridgedCount).toStrictEqual(deployedTokensCount);

    const bridgedCount2 = await connector.bridgeAfterDeploy();
    expect(bridgedCount2).toStrictEqual(0);

    expect(connector.getBridgedTokens()).toHaveLength(deployedTokensCount);

    const fetchedCount = await connector.fetchLocal();
    expect(fetchedCount).toStrictEqual(deployedTokensCount);

    const bridgedCount3 = await connector.bridgeAfterDeploy();
    expect(bridgedCount3).toStrictEqual(0);
  });

  test('testing custom local urls', async () => {
    const connector = Connector.create({ wallet, bitfinityWallet });

    const icrcToken = BridgeIcrcToken.parse({
      icHost: 'http://localhost:9001',
      bftAddress: 'bftAddress',
      baseTokenCanisterId: 'baseTokenCanisterId',
      wrappedTokenAddress: 'wrappedTokenAddress',
      iCRC2MinterCanisterId: '1'
    });

    await connector.fetch([{ type: 'local', tokens: [icrcToken] }]);

    const bridgedCount = connector.bridge();
    expect(bridgedCount).toStrictEqual(1);

    expect(connector.getBridgedTokens()).toHaveLength(1);

    expect(
      connector.getBridgedToken('baseTokenCanisterId')?.bftAddress
    ).toBeTypeOf('string');
    expect(
      connector.getBridgedToken('baseTokenCanisterId')?.bftAddress
    ).toStrictEqual(
      connector.getBridgedToken('wrappedTokenAddress')?.bftAddress
    );

    const bridge = connector.getBridge<'icrc'>('baseTokenCanisterId');
    expect(bridge).toBeInstanceOf(IcrcBridge);
  });
}, 180000);
