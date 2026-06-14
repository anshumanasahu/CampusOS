const statusConfig = {
  attended: { label: 'Attended', variant: 'success' },
  missed: { label: 'Missed', variant: 'danger' },
  skipped: { label: 'Skipped', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
  holiday: { label: 'Holiday', variant: 'info' },
  low: { label: 'Low', variant: 'success' },
  medium: { label: 'Medium', variant: 'warning' },
  high: { label: 'High', variant: 'danger' },
  safe: { label: 'On Track', variant: 'success' },
  warning: { label: 'Warning', variant: 'warning' },
  exceeded: { label: 'Exceeded', variant: 'danger' },
  uploaded: { label: 'Uploaded', variant: 'neutral' },
  extracting: { label: 'Extracting', variant: 'info' },
  review: { label: 'Review', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  failed: { label: 'Failed', variant: 'danger' },
  urgent: { label: 'Urgent', variant: 'danger' },
  normal: { label: 'Normal', variant: 'info' },
};

const variantClasses = {
  success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300',
  info: 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300',
  neutral: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300',
};

export default function StatusTag({ status }) {
  const config = statusConfig[status] || { label: status, variant: 'neutral' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-micro font-medium rounded-full ${variantClasses[config.variant]}`}>
      {config.label}
    </span>
  );
}
