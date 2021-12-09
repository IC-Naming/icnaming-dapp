export const formatAddress = (walletAddress: any) => {
  if (walletAddress !== undefined && walletAddress.length > 0) {
    return walletAddress.slice(0, 5) + "..." + walletAddress.slice(-5);
  } else {
    return "Connect Wallet";
  }
};