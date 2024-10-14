"use client";

import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { type PropsWithChildren, createContext, useContext } from "react";
import { useUserPools } from "#/hooks/useUserPools";

type UserPoolContextType = {
  userPoolSwr: ReturnType<typeof useUserPools>;
};

export const UserPoolContext = createContext({} as UserPoolContextType);

export function UserPoolContextProvider({ children }: PropsWithChildren) {
  const { context } = useIFrameContext();
  const userPoolSwr = useUserPools(context?.chainId, context?.account);
  return (
    <UserPoolContext.Provider
      value={{
        userPoolSwr,
      }}
    >
      {children}
    </UserPoolContext.Provider>
  );
}

export function useUserPoolContext() {
  const context = useContext(UserPoolContext);

  return context;
}
