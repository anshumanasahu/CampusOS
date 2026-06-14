const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-xs hover:shadow-soft active:shadow-inner-soft',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-surface-50 hover:border-slate-300 focus-visible:ring-slate-400',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500',
  ghost: 'bg-transparent text-slate-600 hover:bg-surface-100 hover:text-slate-900',
  brand: 'bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:from-brand-700 hover:to-violet-700 shadow-soft hover:shadow-glow-brand',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100',
};

const sizes = {
  xs: 'px-2.5 py-1 text-micro gap-1',
  sm: 'px-3 py-1.5 text-caption gap-1.5',
  md: 'px-4 py-2 text-body gap-2',
  lg: 'px-5 py-2.5 text-body gap-2',
  xl: 'px-6 py-3 text-base gap-2.5',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        rounded-xl transition-all duration-150 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        active:scale-[0.97]
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
