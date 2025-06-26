// Helper function to check if string represents zero or empty
export const isZeroOrEmpty = (value: string | undefined): boolean => {
  return !value || value === "0" || Number.parseFloat(value) === 0;
};
