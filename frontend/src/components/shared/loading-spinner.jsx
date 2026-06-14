export default function LoadingSpinner({ text, size = 'md', fullscreen = false }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 animate-fade-in">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-brand-100`} />
        <div className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-t-brand-600 animate-spin`} />
      </div>
      {text && <p className="text-sm text-slate-500 animate-pulse">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
}

/**
 * Skeleton loader for cards and content.
 */
export function Skeleton({ className = '', lines = 3 }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-slate-200 rounded-full ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    </div>
  );
}
