const TWO = BigInt(2);

/**
 * Reputation points one vote moves, mirroring validateReputationChange in
 * StakeOverflow.sol: exactly 1 below 2 reputation, otherwise the largest n
 * with 2**n <= reputation, i.e. floor(log2(reputation)).
 *
 * Accepts a number, string or BigInt, because the contract returns uint80.
 */
export const voteWeight = (reputation) => {
  const value = BigInt(reputation ?? 0);
  if (value < TWO) return 1;
  return value.toString(2).length - 1;
};
