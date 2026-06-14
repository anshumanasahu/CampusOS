const variants = {
  success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
  warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-amber-500/20',
  danger: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-red-500/20',
  info: 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-brand-500/20',
  neutral: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 ring-slate-500/10',
  purple: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 ring-violet-500/20',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 ring-cyan-500/20',
};

export default function Badge({ text, variant = 'neutral', dot = false, size = 'sm' }) {
  const sizeClasses = size === 'xs' ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-micro';

  return (
    <span className={`
      inline-flex items-center gap-1 font-medium rounded-full ring-1 ring-inset
      ${sizeClasses}
      ${variants[variant] || variants.neutral}
    `}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {text}
    </span>
  );
}
