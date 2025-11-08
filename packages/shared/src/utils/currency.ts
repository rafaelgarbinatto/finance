/**
 * Format a number as currency string with 2 decimal places
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2);
}

/**
 * Parse a currency string to number
 */
export function parseCurrency(amount: string): number {
  return parseFloat(amount);
}

/**
 * Format currency for display (Brazilian Real)
 */
export function formatCurrencyDisplay(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}


