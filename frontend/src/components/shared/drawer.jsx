import { useEffect } from 'react';

export default function Drawer({ isOpen, title, children, onClose, width = 'md' }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  const widthClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40 transition-opacity animate-fade-in" onClick={onClose} />
      )}
      <div className={`
        fixed top-0 right-0 h-full w-full ${widthClasses[width]} bg-white dark:bg-[#0c0e16] shadow-float z-50
        flex flex-col
        transform transition-transform duration-250 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          <h2 className="text-subheading text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </>
  );
}
