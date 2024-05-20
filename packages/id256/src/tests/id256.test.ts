import { describe, expect, test } from 'vitest';

import { Principal } from '@dfinity/principal';

import { Id256Factory, AddressWithChainID } from '..';

describe('id256 factory', () => {
  const principalStr =
    'jud6s-gvedw-ejmms-cvdvx-ylglk-3y7fo-ftsqv-p6gmg-6lefa-s6vq2-cae';
  const chainId = 355113;
  const address = '0x6154e9189786C2Da9DaBaEA27C71e54A6884e058';

  const principal = Principal.fromText(principalStr);
  const addressWithChain = new AddressWithChainID(address, chainId);

  test('principal round trip', () => {
    const id = Id256Factory.fromPrincipal(principal);

    expect(Id256Factory.toPrincipal(id).toText()).toStrictEqual(principalStr);
  });

  test('chainIdFromId256', () => {
    const id = Id256Factory.from(addressWithChain);

    console.log(Id256Factory.toEvmAddress(id));

    const [c, a] = Id256Factory.toEvmAddress(id)

    expect(c).toEqual(chainId);
    expect(a).toEqual(address.toLowerCase());

    expect(Id256Factory.chainIdFromId256(id)).toStrictEqual(chainId);
  });
});
