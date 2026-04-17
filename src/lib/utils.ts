import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function calculateROI(investment: number, returnMultiple: number): number {
  return investment * returnMultiple
}

export function calculateMonthlyPayout(
  investorAmount: number,
  totalRaised: number,
  monthlyRevenue: number,
  royaltyPercent: number
): number {
  const pool = monthlyRevenue * (royaltyPercent / 100)
  return (investorAmount / totalRaised) * pool
}
