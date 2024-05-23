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
