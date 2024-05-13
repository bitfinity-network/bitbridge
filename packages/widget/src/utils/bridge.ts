import { ethers } from "ethers";

export const getEvmWallet = async () => {
  try {
    if (typeof window !== "undefined") {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      return signer;
    }
  } catch (error) {
    console.log("eth", error);
  }
};

export const toDecimal = (
  amount: bigint | number | string,
  decimal: bigint | number
) => {
  return Number(amount) / 10 ** Number(decimal ?? 0);
};

export const fromDecimal = (
  amount: bigint | number | string,
  decimal: bigint | number
) => {
  return Math.round(Number(amount) * 10 ** Number(decimal ?? 0));
};
