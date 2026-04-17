import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon?: ReactNode
  trend?: string
  className?: string
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-2xl border border-border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {trend && <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>}
    </div>
  )
}
