import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-slate-900 text-white hover:bg-slate-800 shadow-sm': variant === 'primary',
          'bg-slate-100 text-slate-700 hover:bg-slate-200': variant === 'secondary',
          'border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300': variant === 'outline',
          'bg-transparent text-slate-600 hover:bg-slate-100': variant === 'ghost',
          'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200': variant === 'accent',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-8 py-3.5 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
