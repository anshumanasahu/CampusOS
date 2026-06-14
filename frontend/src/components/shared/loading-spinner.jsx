export default function LoadingSpinner({ text, size = 'md', fullscreen = false }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-8 w-8' };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 animate-fade-in">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-brand-100`} />
        <div className={`absolute inset-0 ${sizes[size]} rounded-full border-2 border-transparent border-t-brand-600 animate-spin`} />
      </div>
      {text && <p className="text-caption text-slate-500">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">{content}</div>;
  }
  return <div className="flex items-center justify-center py-16">{content}</div>;
}

export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="widget p-5 space-y-3">
      <div className="shimmer h-4 w-1/3 rounded" />
      <div className="shimmer h-3 w-full rounded" />
      <div className="shimmer h-3 w-5/6 rounded" />
      <div className="shimmer h-3 w-2/3 rounded" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="shimmer h-8 w-48 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
