const variants = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  danger: 'bg-red-50 text-red-700 ring-red-600/10',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/10',
  neutral: 'bg-slate-50 text-slate-600 ring-slate-500/10',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/10',
};

export default function Badge({ text, variant = 'neutral', dot = false }) {
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5
      text-[11px] font-medium rounded-full ring-1 ring-inset
      ${variants[variant] || variants.neutral}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-60`} />}
      {text}
    </span>
  );
}
