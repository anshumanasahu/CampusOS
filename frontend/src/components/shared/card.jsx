export default function Card({ children, title, subtitle, action, footer, className = '', hover = false, padding = true, animate = false }) {
  return (
    <div className={`
      widget
      ${hover ? 'lift cursor-pointer' : ''}
      ${animate ? 'animate-fade-up' : ''}
      ${className}
    `}>
      {(title || subtitle || action) && (
        <div className={`flex items-start justify-between relative z-[1] ${padding ? 'px-5 pt-5 pb-0' : 'px-4 pt-4 pb-0'}`}>
          <div>
            {title && <h3 className="text-body font-semibold text-slate-800 dark:text-[#f1f5f9]">{title}</h3>}
            {subtitle && <p className="text-caption text-slate-500 dark:text-[#94a3b8] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`relative z-[1] ${padding ? 'p-5' : 'p-4'}`}>{children}</div>
      {footer && (
        <div className="relative z-[1] px-5 py-3 border-t border-slate-50 dark:border-white/[0.04] bg-surface-50/50 dark:bg-white/[0.01] rounded-b-2xl text-caption">
          {footer}
        </div>
      )}
    </div>
  );
}

export function MetricCard({ label, value, change, icon, color = 'brand' }) {
  const colors = {
    brand: 'from-brand-50 to-violet-50 dark:from-brand-950/40 dark:to-violet-950/40 text-brand-600 dark:text-brand-400',
    success: 'from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 text-emerald-600 dark:text-emerald-400',
    warning: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 text-amber-600 dark:text-amber-400',
    danger: 'from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 text-red-600 dark:text-red-400',
  };

  return (
    <div className="widget p-5 lift">
      <div className="relative z-[1] flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-base`}>
          {icon}
        </div>
        {change !== undefined && change !== null && (
          <span className={`text-micro font-semibold px-1.5 py-0.5 rounded-full ${change > 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="relative z-[1]">
        <p className="text-heading text-slate-900 dark:text-[#f1f5f9]">{value}</p>
        <p className="text-caption text-slate-500 dark:text-[#94a3b8] mt-0.5">{label}</p>
      </div>
    </div>
  );
}
