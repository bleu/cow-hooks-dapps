export enum InputFieldName {
  SupplyAmount = "supplyAmount",
  BorrowAmount = "borrowAmount",
  RepayAmount = "repayAmount",
  WithdrawAmount = "withdrawAmount",
}

export enum MaxFieldName {
  IsMaxSupply = "isMaxSupply",
  IsMaxBorrow = "isMaxBorrow",
  IsMaxRepay = "isMaxRepay",
  IsMaxWithdraw = "isMaxWithdraw",
}

export enum OperationType {
  SupplyBorrow = "supply-borrow",
  RepayWithdraw = "repay-withdraw",
}

export const FORM_TABS = [
  {
    value: OperationType.SupplyBorrow,
    label: "Add/Borrow",
  },
  {
    value: OperationType.RepayWithdraw,
    label: "Repay/Withdraw",
  },
];
