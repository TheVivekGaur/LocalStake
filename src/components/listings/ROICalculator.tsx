import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { Calculator, TrendingUp, Clock, IndianRupee } from 'lucide-react'
import type { Listing } from '@/types'

export function ROICalculator({ listing }: { listing: Listing }) {
  const [amount, setAmount] = useState(listing.minInvestment)

  const totalReturn = amount * listing.returnMultiple
  const profit = totalReturn - amount
  const monthlyEstimate = profit / listing.estimatedDuration
  const effectiveROI = ((listing.returnMultiple - 1) / (listing.estimatedDuration / 12)) * 100

  return (
    <Card className="border-accent/20 bg-accent/5">
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-lg">ROI Calculator</h3>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-muted mb-2">Investment Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-medium">₹</span>
          <input
            type="range"
            min={listing.minInvestment}
            max={listing.maxInvestment}
            step={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full mb-2 accent-accent"
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted">{formatCurrency(listing.minInvestment)}</span>
            <span className="text-xl font-bold text-accent">{formatCurrency(amount)}</span>
            <span className="text-muted">{formatCurrency(listing.maxInvestment)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1.5 text-muted mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Total Return</span>
          </div>
          <p className="text-lg font-bold text-accent">{formatCurrency(totalReturn)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1.5 text-muted mb-1">
            <IndianRupee className="w-4 h-4" />
            <span className="text-xs">Profit</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(profit)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1.5 text-muted mb-1">
            <IndianRupee className="w-4 h-4" />
            <span className="text-xs">Monthly (est.)</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(Math.round(monthlyEstimate))}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1.5 text-muted mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Annualized ROI</span>
          </div>
          <p className="text-lg font-bold text-foreground">{effectiveROI.toFixed(1)}%</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded-xl border border-border">
        <p className="text-sm text-muted text-center">
          You invest <span className="font-bold text-foreground">{formatCurrency(amount)}</span> →
          Receive <span className="font-bold text-accent">{formatCurrency(totalReturn)}</span> over{' '}
          <span className="font-bold text-foreground">{listing.estimatedDuration} months</span>
        </p>
      </div>
    </Card>
  )
}
