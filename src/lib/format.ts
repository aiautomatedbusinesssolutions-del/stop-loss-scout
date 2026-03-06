const LOCALE = "en-US";

export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (price >= 0.01) return price.toLocaleString(LOCALE, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  return price.toLocaleString(LOCALE, { minimumFractionDigits: 6, maximumFractionDigits: 8 });
}

export function formatUSD(value: number): string {
  return value.toLocaleString(LOCALE, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCoinAmount(amount: number): string {
  if (amount >= 1000) return amount.toLocaleString(LOCALE, { maximumFractionDigits: 2 });
  if (amount >= 1) return amount.toLocaleString(LOCALE, { maximumFractionDigits: 4 });
  if (amount >= 0.001) return amount.toLocaleString(LOCALE, { maximumFractionDigits: 6 });
  return amount.toLocaleString(LOCALE, { maximumFractionDigits: 8 });
}
