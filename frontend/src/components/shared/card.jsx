export default function Card({ children, title, subtitle, footer, className = '', hover = false, padding = true }) {
  return (
    <div className={`
      bg-white rounded-2xl border border-slate-100 shadow-soft
      ${hover ? 'card-hover cursor-pointer' : ''}
      ${className}
    `}>
      {(title || subtitle) && (
        <div className={`${padding ? 'px-5 pt-5 pb-0' : 'px-4 pt-4 pb-0'}`}>
          {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className={padding ? 'p-5' : 'p-4'}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}
