import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  size?: 'sm' | 'md'
}

export function ProgressBar({ value, className, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn(
      'w-full rounded-full overflow-hidden',
      size === 'sm' ? 'h-1.5 bg-slate-100' : 'h-2.5 bg-slate-100',
      className
    )}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
