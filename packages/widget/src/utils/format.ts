export const shortenAddress = (
  address: string,
  prefix: number = 4,
  suffix: number = 4
) => {
  if (address) {
    const p = address.substr(0, prefix);
    const s = address.substr(-suffix);
    return `${p}...${s}`;
  }
  return "";
};

export const toDecimal = (
  amount: bigint | number | string,
  decimal: bigint | number,
) => {
  return Number(amount) / 10 ** Number(decimal ?? 0);
};

export const fromDecimal = (
  amount: bigint | number | string,
  decimal: bigint | number,
) => {
  return Math.round(Number(amount) * 10 ** Number(decimal ?? 0));
};
