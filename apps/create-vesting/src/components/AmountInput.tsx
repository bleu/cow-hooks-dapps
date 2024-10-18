import { TokenAmountInput, type ITokenAmountInput } from "@bleu/cow-hooks-ui";
import type { Token } from "@uniswap/sdk-core";

export const AmountInput = ({
  token,
  vestAllFromSwap,
  vestAllFromAccount,
  amountPreview,
  amountPreviewFullDecimals,
  formattedUserBalance,
  userBalanceFloat,
}: {
  token: Token | undefined;
  vestAllFromSwap: boolean;
  vestAllFromAccount: boolean;
  amountPreview: string | undefined;
  amountPreviewFullDecimals: string | undefined;
  formattedUserBalance: string | undefined;
  userBalanceFloat: number | undefined;
}) => {
  return (
    <TokenAmountInput
      name="amount"
      type="number"
      step={`0.${"0".repeat(token?.decimals ? token?.decimals - 1 : 8)}1`}
      token={token}
      label="Vesting Amount"
      placeholder="0.0"
      autoComplete="off"
      disabled={vestAllFromSwap || vestAllFromAccount}
      disabledValue={amountPreview}
      disabledValueFullDecimals={amountPreviewFullDecimals}
      userBalance={formattedUserBalance}
      userBalanceFullDecimals={String(userBalanceFloat)}
      validation={{
        setValueAs: (v) => (v === "" ? undefined : Number(v)),
        required: !(vestAllFromAccount || vestAllFromSwap),
      }}
      onKeyDown={(e) =>
        ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
      }
    />
  );
};
