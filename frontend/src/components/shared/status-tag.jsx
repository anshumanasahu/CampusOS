const statusStyles = {
  // Attendance
  attended: { label: 'Attended', color: 'bg-green-100 text-green-800' },
  missed: { label: 'Missed', color: 'bg-red-100 text-red-800' },
  skipped: { label: 'Skipped', color: 'bg-amber-100 text-amber-800' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-600' },
  holiday: { label: 'Holiday', color: 'bg-blue-100 text-blue-800' },

  // Burnout
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' },

  // Budget
  safe: { label: 'On Track', color: 'bg-green-100 text-green-800' },
  warning: { label: 'Warning', color: 'bg-amber-100 text-amber-800' },
  exceeded: { label: 'Exceeded', color: 'bg-red-100 text-red-800' },

  // Documents
  uploaded: { label: 'Uploaded', color: 'bg-slate-100 text-slate-600' },
  extracting: { label: 'Extracting', color: 'bg-indigo-100 text-indigo-700' },
  review: { label: 'Review', color: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },

  // Notifications
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
};

export default function StatusTag({ status }) {
  const style = statusStyles[status] || { label: status, color: 'bg-slate-100 text-slate-600' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${style.color}`}>
      {style.label}
    </span>
  );
}
