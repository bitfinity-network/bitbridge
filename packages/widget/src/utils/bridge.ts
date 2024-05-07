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
