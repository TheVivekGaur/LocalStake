import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'accent' | 'warning' | 'destructive'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        {
          'bg-slate-100 text-slate-600': variant === 'default',
          'bg-emerald-50 text-emerald-700 border border-emerald-200': variant === 'accent',
          'bg-amber-50 text-amber-700 border border-amber-200': variant === 'warning',
          'bg-red-50 text-red-700 border border-red-200': variant === 'destructive',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
