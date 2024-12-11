interface TokenId {
  address: string;
  chainId: number;
}

function isTokenInList(token: TokenId, list: TokenId[]) {
  return list.some(
    (token2) =>
      token2.chainId === token.chainId &&
      token2.address.toLowerCase() === token.address.toLowerCase(),
  );
}

export function combineTokenLists<T extends TokenId>(...lists: T[][]): T[] {
  if (lists.length === 0) return [];
  if (lists.length === 1) return lists[0];

  // Start with the last list and work backwards
  return lists.reduceRight((accumulated: T[], current: T[]) => {
    // Filter out tokens from the current list that already exist in accumulated
    const uniqueTokens = current.filter(
      (token) => !isTokenInList(token, accumulated),
    );

    // biome-ignore lint:
    uniqueTokens.forEach((token) => accumulated.unshift(token));
    return accumulated;
  });
}
