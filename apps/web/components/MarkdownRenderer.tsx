'use client'

import ReactMarkdown from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body text-secondary text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-syne font-700 text-xl text-white mt-6 mb-3 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-syne font-600 text-base text-accent mt-6 mb-2.5 first:mt-0 flex items-center gap-2">
              <span className="w-1 h-4 bg-accent rounded-full inline-block flex-shrink-0" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-syne font-600 text-sm text-white/90 mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-secondary leading-relaxed mb-3 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 mb-4 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 last:mb-0 list-none counter-reset-[item]">{children}</ol>
          ),
          li: ({ children, ...props }) => {
            const isOrdered = (props as any).ordered
            return (
              <li className="flex items-start gap-2.5 text-secondary">
                {isOrdered ? (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] text-accent font-mono font-600 mt-0.5">
                    {(props as any).index + 1}
                  </span>
                ) : (
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                )}
                <span className="flex-1">{children}</span>
              </li>
            )
          },
          strong: ({ children }) => (
            <strong className="text-white font-600">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-secondary/80 not-italic border-l-2 border-accent/30 pl-2">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/40 pl-4 my-3 text-secondary/70 italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="font-mono text-xs bg-raised border border-border rounded px-1.5 py-0.5 text-accent">
              {children}
            </code>
          ),
          hr: () => <hr className="border-border my-5" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
