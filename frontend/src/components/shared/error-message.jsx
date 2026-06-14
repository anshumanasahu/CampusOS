import Button from './button.jsx';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-12 h-12 mb-4 rounded-2xl bg-danger-50 dark:bg-danger-950/30 border border-danger-100 dark:border-danger-800/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-danger-500 dark:text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-body text-slate-700 dark:text-[#e2e8f0] mb-1 font-medium">Something went wrong</p>
      <p className="text-caption text-slate-500 dark:text-[#94a3b8] mb-4 max-w-xs">{message || 'An unexpected error occurred'}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
