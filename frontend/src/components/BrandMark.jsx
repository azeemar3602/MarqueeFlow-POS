import { Receipt } from 'lucide-react'

/** MarqueeFlow POS logo — receipt icon in teal diamond (distinct from generic "M" square POS apps). */
export default function BrandMark({ size = 'md', className = '' }) {
  const sizes = {
    sm: { box: 'w-8 h-8 rounded-lg', icon: 16 },
    md: { box: 'w-11 h-11 rounded-xl', icon: 22 },
    lg: { box: 'w-14 h-14 rounded-2xl', icon: 28 },
  }
  const s = sizes[size] || sizes.md
  return (
    <div className={`${s.box} bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-600/25 rotate-3 ${className}`}>
      <Receipt size={s.icon} className="text-white -rotate-3" strokeWidth={2.25} />
    </div>
  )
}
