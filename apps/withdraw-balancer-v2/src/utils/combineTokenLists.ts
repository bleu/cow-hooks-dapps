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

export function combineTokenLists<T extends TokenId>(
  oldList: T[],
  newList: T[],
): T[] {
  // Avoid storing the same token many times
  const oldListFiltered = oldList.filter(
    (token) => !isTokenInList(token, newList),
  );

  const resultList = [...oldListFiltered, ...newList];

  return resultList;
}
