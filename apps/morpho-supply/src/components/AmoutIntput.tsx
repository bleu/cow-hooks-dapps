import { TokenAmountInput } from "@bleu/cow-hooks-ui";
import { Token } from "@uniswap/sdk-core";
import type { Address } from "viem";

interface AmountInputProps {
  name: string;
  label: string;
  asset: {
    address: Address;
    decimals: number;
    name: string;
    symbol: string;
    priceUsd: number;
    logoURI: string;
  };
  chainId: number;
  formattedBalance: string;
  floatBalance: number;
  fiatBalance: string;
}

export const AmountInput = ({
  name,
  label,
  asset,
  chainId,
  formattedBalance,
  floatBalance,
  fiatBalance,
}: AmountInputProps) => {
  const handleSetValue = (value: string) => {
    if (value === "") return undefined;
    if (typeof value === "number") return value;

    let v = value;
    v = v.replace(",", ".");
    const inputedDecimals = v.includes(".") && v.split(".").at(-1);
    if (inputedDecimals && inputedDecimals.length > asset.decimals)
      return Number(v.slice(0, -(inputedDecimals.length - asset.decimals)));
    return Number(v);
  };

  return (
    <TokenAmountInput
      name={name}
      type="number"
      inputMode="decimal"
      step={`0.${"0".repeat(asset.decimals - 1)}1`}
      max="1000000000000"
      token={new Token(chainId, asset.address, asset.decimals, asset.symbol)}
      label={label}
      placeholder="0.0"
      autoComplete="off"
      disabled={false}
      userBalance={formattedBalance}
      userBalanceFullDecimals={String(floatBalance)}
      fiatAmount={fiatBalance}
      shouldEnableMaxSelector={true}
      validation={{ setValueAs: handleSetValue }}
      onKeyDown={(e) =>
        ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
      }
    />
  );
};
