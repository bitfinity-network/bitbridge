export const shortenAddress = (
  address: string,
  prefix: number = 4,
  suffix: number = 4
) => {
  if (address) {
    const p = address.slice(0, prefix);
    const s = address.slice(-suffix);
    return `${p}...${s}`;
  }
  return '';
};

export const toFloating = (
  amount: bigint | number | string,
  decimal: bigint | number
) => {
  return Number(amount) / 10 ** Number(decimal ?? 0);
};

export const fromFloating = (
  amount: bigint | number | string,
  decimal: bigint | number
): bigint => {
  return BigInt(Math.round(Number(amount) * 10 ** Number(decimal ?? 0)));
};
