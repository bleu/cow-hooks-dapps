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

export enum FormTabs {
  AddBorrow = "add-borrow",
  RepayWithdraw = "repay-withdraw",
}

export const FORM_TABS = [
  {
    value: FormTabs.AddBorrow,
    label: "Add/Borrow",
  },
  {
    value: FormTabs.RepayWithdraw,
    label: "Repay/Withdraw",
  },
];
