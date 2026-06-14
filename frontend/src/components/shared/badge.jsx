const variants = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function Badge({ text, variant = 'neutral' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium rounded-md border
        ${variants[variant] || variants.neutral}
      `}
    >
      {text}
    </span>
  );
}
