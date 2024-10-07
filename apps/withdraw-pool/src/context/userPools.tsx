"use client";

import { useUserPools } from "#/hooks/useUserPools";
import { createContext, PropsWithChildren, useContext } from "react";
import { useIFrameContext } from "@bleu/cow-hooks-ui";

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
