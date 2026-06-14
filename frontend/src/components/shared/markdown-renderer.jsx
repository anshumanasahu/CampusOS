import ReactMarkdown from 'react-markdown';

/**
 * Secure Markdown renderer for chatbot messages.
 * Renders: bold, italic, headings, bullets, numbered lists, code, tables, blockquotes, hr.
 * Sanitized: no raw HTML allowed (react-markdown escapes by default).
 * No XSS risk — react-markdown does not render arbitrary HTML unless explicitly enabled.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <ReactMarkdown
      components={{
        // Headings
        h1: ({ children }) => <p className="text-base font-bold text-slate-900 mt-2 mb-1">{children}</p>,
        h2: ({ children }) => <p className="text-sm font-bold text-slate-800 mt-2 mb-1">{children}</p>,
        h3: ({ children }) => <p className="text-sm font-semibold text-slate-800 mt-1.5 mb-0.5">{children}</p>,
        h4: ({ children }) => <p className="text-sm font-semibold text-slate-700 mt-1 mb-0.5">{children}</p>,

        // Paragraphs
        p: ({ children }) => <p className="text-sm text-slate-700 mb-1.5 last:mb-0 leading-relaxed">{children}</p>,

        // Bold & Italic
        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,

        // Lists
        ul: ({ children }) => <ul className="ml-1 mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="ml-1 mb-2 space-y-0.5 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => (
          <li className="text-sm text-slate-700 flex items-start gap-1.5">
            <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
            <span className="flex-1">{children}</span>
          </li>
        ),

        // Code
        code: ({ inline, children }) =>
          inline ? (
            <code className="px-1 py-0.5 bg-slate-200 text-slate-800 rounded text-xs font-mono">{children}</code>
          ) : (
            <pre className="bg-slate-800 text-slate-100 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono">
              <code>{children}</code>
            </pre>
          ),
        pre: ({ children }) => <>{children}</>,

        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-3 border-indigo-300 pl-3 my-2 text-sm text-slate-600 italic">
            {children}
          </blockquote>
        ),

        // Horizontal rule
        hr: () => <hr className="my-2 border-slate-200" />,

        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-100">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-slate-100">{children}</tr>,
        th: ({ children }) => <th className="text-left px-2 py-1.5 font-semibold text-slate-700">{children}</th>,
        td: ({ children }) => <td className="px-2 py-1.5 text-slate-600">{children}</td>,

        // Links (render as text, no navigation)
        a: ({ children }) => <span className="text-indigo-600 underline">{children}</span>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
