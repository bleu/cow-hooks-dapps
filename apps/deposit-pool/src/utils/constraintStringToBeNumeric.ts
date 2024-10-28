export function constraintStringToBeNumeric(str: string) {
  // 1. Replace commas with dots
  let result = str.replace(",", ".");

  // 2. If there's more than one dot, remove the leftmost one
  const dotCount = (result.match(/\./g) || []).length;
  if (dotCount > 1) {
    result = result.replace(".", "");
  }

  // 3. Keep only numbers and dots
  result = result.replace(/[^0-9.]/g, "");

  return result;
}
