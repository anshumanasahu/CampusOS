import Button from './button.jsx';

export default function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-brand-50 via-violet-50 to-brand-50 dark:from-brand-950/30 dark:via-violet-950/30 dark:to-brand-950/30 border border-brand-100/50 dark:border-brand-800/20 flex items-center justify-center shadow-soft">
        {icon || <span className="text-2xl">📭</span>}
      </div>
      <h3 className="text-subheading text-slate-800 dark:text-[#f1f5f9] mb-1.5">{title}</h3>
      {description && <p className="text-body text-slate-500 dark:text-[#94a3b8] max-w-sm leading-relaxed mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="brand" size="md" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
