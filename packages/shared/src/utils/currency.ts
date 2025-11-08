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

/**
 * Convert Decimal to string with 2 decimal places
 */
export function decimalToString(decimal: any): string {
  if (decimal === null || decimal === undefined) {
    return '0.00';
  }
  const num = typeof decimal.toNumber === 'function' ? decimal.toNumber() : parseFloat(String(decimal));
  return formatCurrency(num);
}
