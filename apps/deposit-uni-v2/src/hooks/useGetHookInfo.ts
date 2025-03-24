import {
  type IHooksInfo,
  type IPool,
  useHookDeadline,
  useIFrameContext,
  useTokensAllowances,
} from "@bleu/cow-hooks-ui";
import { type DepositFormType, uniswapRouterMap } from "@bleu/utils";
import {
  type ERC20ApproveArgs,
  type ERC20TransferFromArgs,
  TRANSACTION_TYPES,
  TransactionFactory,
  type UniswapDepositArgs,
} from "@bleu/utils/transactionFactory";
import { BigNumber } from "ethers";
import { useCallback, useMemo } from "react";
import { type Address, erc20Abi, maxUint256, parseUnits } from "viem";

const SLIPPAGE = BigInt(2000); // 2% slippage

export function useGetHookInfo(pool?: IPool) {
  const { cowShedProxy, context, publicClient } = useIFrameContext();
  const tokenAllowances = useTokensAllowances({
    tokenAddresses: pool?.poolTokens.map((token) => token.address) || [],
    spender: cowShedProxy,
  });

  const deadline = useHookDeadline({ context });

  const uniswapRouterAddress = useMemo(() => {
    if (!context?.chainId) return;
    return uniswapRouterMap[context?.chainId];
  }, [context]);

  const defaultPermitData = useMemo(() => {
    return pool?.poolTokens.map((token) => {
      return {
        tokenAddress: token.address,
        amount: maxUint256,
        tokenSymbol: token.symbol,
      };
    });
  }, [pool]);

  const getPermitData = useCallback(
    (params: DepositFormType) => {
      if (!pool) throw new Error("Missing pool");

      if (!tokenAllowances) return defaultPermitData;

      const amountsWithBuffer = pool.poolTokens.map((token) => {
        const tokenAddress = token.address.toLowerCase();
        const amount = params.amounts[tokenAddress];
        const amountBigNumber = BigNumber.from(
          parseUnits(amount.toString(), token.decimals),
        );
        return {
          tokenAddress,
          amount: amountBigNumber.toBigInt(),
          tokenSymbol: token.symbol,
        };
      });

      // Filter tokens that need approval and build max permit data
      return (
        amountsWithBuffer
          .filter((permitInfo) => {
            const allowance = tokenAllowances[permitInfo.tokenAddress];
            return (
              !allowance || BigNumber.from(allowance).lt(permitInfo.amount)
            );
          })
          .map((permitInfo) => {
            return {
              tokenAddress: permitInfo.tokenAddress,
              amount: maxUint256,
              tokenSymbol: permitInfo.tokenSymbol,
            };
          }) || []
      );
    },
    [pool, tokenAllowances, defaultPermitData],
  );

  const getPoolDepositTxs = useCallback(
    async (params: DepositFormType) => {
      if (
        !pool ||
        !context ||
        !context.account ||
        !cowShedProxy ||
        !uniswapRouterAddress ||
        !publicClient
      )
        throw new Error("Missing context");

      const referenceTokenDecimals = pool.poolTokens.find(
        (token) =>
          token.address.toLowerCase() ===
          params.referenceTokenAddress.toLowerCase(),
      )?.decimals;

      if (!referenceTokenDecimals) throw new Error("Invalid reference token");

      const tokenA = pool.poolTokens[0];
      const tokenB = pool.poolTokens[1];

      const desiredAmountA = parseUnits(
        params.amounts[tokenA.address.toLowerCase()],
        tokenA.decimals,
      );
      const desiredAmountB = parseUnits(
        params.amounts[tokenB.address.toLowerCase()],
        tokenB.decimals,
      );

      const amountAMin =
        (desiredAmountA * (BigInt(100_000) - SLIPPAGE)) / BigInt(100_000);
      const amountBMin =
        (desiredAmountB * (BigInt(100_000) - SLIPPAGE)) / BigInt(100_000);

      const depositArg: UniswapDepositArgs = {
        type: TRANSACTION_TYPES.UNISWAP_DEPOSIT,
        uniswapRouterAddress,
        tokenA: pool.poolTokens[0].address,
        tokenB: pool.poolTokens[1].address,
        amountADesired: desiredAmountA,
        amountBDesired: desiredAmountB,
        amountAMin,
        amountBMin,
        recipient: context.account,
        deadline,
      };

      const transferFromUserToProxyArgs = [
        { amount: desiredAmountA, token: tokenA },
        { amount: desiredAmountB, token: tokenB },
      ].map((tokenAmount) => {
        return {
          type: TRANSACTION_TYPES.ERC20_TRANSFER_FROM,
          token: tokenAmount.token.address,
          from: context.account,
          to: cowShedProxy,
          amount: tokenAmount.amount,
          symbol: tokenAmount.token.symbol,
        } as ERC20TransferFromArgs;
      });

      const allowances = await publicClient.multicall({
        contracts: pool.poolTokens.map((token) => ({
          address: token.address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [cowShedProxy, uniswapRouterAddress],
        })),
      });

      const approveArgs = pool.poolTokens
        .map((token, idx) => {
          if (
            allowances[idx].status === "failure" ||
            (BigInt(0) < BigInt(allowances[idx].result) &&
              BigInt(allowances[idx].result) < maxUint256 / BigInt(10))
          )
            return [
              {
                type: TRANSACTION_TYPES.ERC20_APPROVE,
                token: token.address as Address,
                spender: uniswapRouterAddress,
                amount: BigInt(0),
              },
              {
                type: TRANSACTION_TYPES.ERC20_APPROVE,
                token: token.address as Address,
                spender: uniswapRouterAddress,
                amount: maxUint256,
              },
            ] as ERC20ApproveArgs[];

          if (BigInt(0) === BigInt(allowances[idx].result))
            return [
              {
                type: TRANSACTION_TYPES.ERC20_APPROVE,
                token: token.address as Address,
                spender: uniswapRouterAddress,
                amount: maxUint256,
              },
            ] as ERC20ApproveArgs[];

          return [] as ERC20ApproveArgs[];
        })
        .flat(2);

      const resetApprovalsArgs = pool.poolTokens.map((token) => {
        return {
          type: TRANSACTION_TYPES.ERC20_APPROVE,
          token: token.address as Address,
          spender: uniswapRouterAddress,
          amount: BigInt(0),
        } as ERC20ApproveArgs;
      });

      return Promise.all(
        [
          ...transferFromUserToProxyArgs,
          ...approveArgs,
          depositArg,
          ...resetApprovalsArgs,
        ].map((arg) => TransactionFactory.createRawTx(arg.type, arg)),
      );
    },
    [context, cowShedProxy, pool, uniswapRouterAddress, deadline, publicClient],
  );

  return useCallback(
    async (args: DepositFormType): Promise<IHooksInfo> => {
      const [permitData, poolDepositTxs] = await Promise.all([
        getPermitData(args),
        getPoolDepositTxs(args),
      ]);

      return {
        permitData: permitData || [],
        txs: poolDepositTxs,
      };
    },
    [getPermitData, getPoolDepositTxs],
  );
}
