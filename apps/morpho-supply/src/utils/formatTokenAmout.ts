const defaultCompactTokenFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const defaultStandardTokenFormat = new Intl.NumberFormat("en-US", {
  notation: "standard",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export const formatTokenAmount = (
  amount: number | bigint | string,
  options: Intl.NumberFormatOptions & { compact?: boolean } = {},
): string => {
  const { compact = false, ...customOptions } = options;

  const baseFormatter = compact
    ? defaultCompactTokenFormat
    : defaultStandardTokenFormat;

  const needsCustomFormatter = Object.keys(customOptions).length > 0;

  if (needsCustomFormatter) {
    return new Intl.NumberFormat("en-US", {
      ...baseFormatter.resolvedOptions(),
      ...customOptions,
    }).format(Number(amount));
  }

  return baseFormatter.format(Number(amount));
};
