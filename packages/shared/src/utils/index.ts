import type { ProblemJson } from '../types';

/**
 * Format currency in BRL
 */
export function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

/**
 * Parse currency string to decimal string with 2 decimals
 */
export function parseCurrency(value: string): string {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

/**
 * Format date in pt-BR
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Create RFC7807 Problem JSON response
 */
export function createProblem(
  status: number,
  title: string,
  detail?: string,
  type?: string
): ProblemJson {
  return {
    type: type || 'about:blank',
    title,
    status,
    detail,
  };
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
