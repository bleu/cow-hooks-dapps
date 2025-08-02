import { useMemo, useState } from "react";
import type { MorphoMarket } from "../types";

// Enums for better type safety
export enum TokenType {
  COLLATERAL = "collateral",
  LOAN = "loan",
}

export enum FilterType {
  COLLATERAL = "collateral",
  LOAN = "loan",
}

// Token interface for better type safety
export interface MarketTokenInfo {
  address: string;
  symbol: string;
  logoURI: string;
}

// Utility functions
const normalizeAddress = (address: string): string => address.toLowerCase();

export const mapFilterTypeToTokenType = (filterType: FilterType): TokenType => {
  return filterType === FilterType.COLLATERAL
    ? TokenType.COLLATERAL
    : TokenType.LOAN;
};

const createTokenMap = (
  markets: MorphoMarket[],
  assetType: TokenType,
): Map<string, MarketTokenInfo> => {
  const tokens = new Map<string, MarketTokenInfo>();
  for (const market of markets) {
    const asset =
      assetType === TokenType.COLLATERAL
        ? market.collateralAsset
        : market.loanAsset;
    const key = normalizeAddress(asset.address);
    if (!tokens.has(key)) {
      tokens.set(key, {
        address: asset.address,
        symbol: asset.symbol,
        logoURI: asset.logoURI,
      });
    }
  }
  return tokens;
};

const filterMarketsByTokens = (
  markets: MorphoMarket[],
  selectedCollateralTokens: Set<string>,
  selectedLoanTokens: Set<string>,
  search: string,
): MorphoMarket[] => {
  return markets.filter((market) => {
    const collateralSelected =
      selectedCollateralTokens.size === 0 ||
      selectedCollateralTokens.has(
        normalizeAddress(market.collateralAsset.address),
      );
    const loanSelected =
      selectedLoanTokens.size === 0 ||
      selectedLoanTokens.has(normalizeAddress(market.loanAsset.address));

    if (!collateralSelected || !loanSelected) return false;

    if (search) {
      const searchLower = search.toLowerCase();
      const marketString =
        `${market.collateralAsset.symbol} ${market.loanAsset.symbol}`.toLowerCase();
      return marketString.includes(searchLower);
    }

    return true;
  });
};

// Custom hook for filter management
export function useMarketFilters(markets: MorphoMarket[]) {
  const [filterType, setFilterType] = useState<FilterType>(
    FilterType.COLLATERAL,
  );
  const [selectedCollateralTokens, setSelectedCollateralTokens] = useState<
    Set<string>
  >(new Set());
  const [selectedLoanTokens, setSelectedLoanTokens] = useState<Set<string>>(
    new Set(),
  );
  const [search, setSearch] = useState("");

  // Extract unique tokens from markets
  const collateralTokens = useMemo((): MarketTokenInfo[] => {
    const tokens = createTokenMap(markets, TokenType.COLLATERAL);
    return Array.from(tokens.values());
  }, [markets]);

  const loanTokens = useMemo((): MarketTokenInfo[] => {
    const tokens = createTokenMap(markets, TokenType.LOAN);
    return Array.from(tokens.values());
  }, [markets]);

  // Filter markets based on selected tokens and search
  const filteredMarkets = useMemo(() => {
    return filterMarketsByTokens(
      markets,
      selectedCollateralTokens,
      selectedLoanTokens,
      search,
    );
  }, [markets, selectedCollateralTokens, selectedLoanTokens, search]);

  const handleTokenToggle = (tokenAddress: string, type: TokenType) => {
    const address = normalizeAddress(tokenAddress);
    if (type === TokenType.COLLATERAL) {
      setSelectedCollateralTokens((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(address)) {
          newSet.delete(address);
        } else {
          newSet.add(address);
        }
        return newSet;
      });
    } else {
      setSelectedLoanTokens((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(address)) {
          newSet.delete(address);
        } else {
          newSet.add(address);
        }
        return newSet;
      });
    }
  };

  const clearFilters = () => {
    if (filterType === FilterType.COLLATERAL) {
      setSelectedCollateralTokens(new Set());
    } else {
      setSelectedLoanTokens(new Set());
    }
  };

  const getFilterLabel = (type: FilterType) => {
    const selectedCount =
      type === FilterType.COLLATERAL
        ? selectedCollateralTokens.size
        : selectedLoanTokens.size;
    if (selectedCount === 0) return "All";
    if (selectedCount === 1) {
      const tokens =
        type === FilterType.COLLATERAL ? collateralTokens : loanTokens;
      const selectedToken = tokens.find((token) =>
        (type === FilterType.COLLATERAL
          ? selectedCollateralTokens
          : selectedLoanTokens
        ).has(token.address.toLowerCase()),
      );
      return selectedToken?.symbol || "All";
    }
    // For multiple selections, just show the count
    return null;
  };

  const resetSearch = () => {
    setSearch("");
  };

  return {
    filterType,
    setFilterType,
    selectedCollateralTokens,
    selectedLoanTokens,
    search,
    setSearch,
    collateralTokens,
    loanTokens,
    filteredMarkets,
    handleTokenToggle,
    clearFilters,
    getFilterLabel,
    resetSearch,
  };
}
