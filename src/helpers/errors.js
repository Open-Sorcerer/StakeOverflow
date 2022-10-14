/** Turns wallet, RPC and viem errors into one short human sentence. */
export const readableError = (error) => {
  if (!error) return "Something went wrong.";

  // viem wraps the wallet's error; walk the cause chain for a user rejection.
  for (let e = error; e; e = e.cause) {
    if (e.code === 4001 || e.name === "UserRejectedRequestError") {
      return "Request rejected in your wallet.";
    }
  }

  const text = error.shortMessage || error.data?.message || error.message || String(error);
  return text
    .replace(/^Internal JSON-RPC error\.\s*/i, "")
    .replace(/^.*execution reverted:\s*/i, "")
    .slice(0, 160);
};
