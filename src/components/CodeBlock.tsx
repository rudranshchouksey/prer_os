import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MacCodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function MacCodeBlock({ code, language = 'typescript', title }: MacCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden shadow-soft-lg border border-border/30">
      {/* Mac-style header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e2e] border-b border-[#313244]">
        <div className="flex items-center gap-2">
          {/* Terminal dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#f38ba8]" />
            <div className="w-3 h-3 rounded-full bg-[#f9e2af]" />
            <div className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
          </div>
          {title && (
            <span className="ml-3 text-xs text-[#a6adc8] font-mono">{title}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
            "hover:bg-[#313244] text-[#a6adc8]"
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#a6e3a1]" />
              <span className="text-[#a6e3a1]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: '1rem 1.25rem',
          background: '#1e1e2e',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          borderRadius: 0,
        }}
        showLineNumbers={code.split('\n').length > 3}
        wrapLines
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

interface CodeBlockProps {
  content: string;
  className?: string;
}

// Parse content and render code blocks with syntax highlighting
export function CodeBlock({ content, className }: CodeBlockProps) {
  // Split content by code blocks (triple backticks)
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        // Check if this is a code block
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const lines = part.slice(3, -3).split('\n');
          const firstLine = lines[0].trim();
          
          // Check if first line is a language identifier
          const languageMatch = firstLine.match(/^(\w+)$/);
          const language = languageMatch ? firstLine : 'text';
          const code = languageMatch 
            ? lines.slice(1).join('\n').trim()
            : lines.join('\n').trim();

          return (
            <MacCodeBlock 
              key={index} 
              code={code} 
              language={language}
              title={languageMatch ? `${language}` : undefined}
            />
          );
        }

        // Check for inline code (single backticks)
        const inlineParts = part.split(/(`[^`]+`)/g);
        
        return (
          <span key={index}>
            {inlineParts.map((inlinePart, inlineIndex) => {
              if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
                return (
                  <code
                    key={inlineIndex}
                    className="px-1.5 py-0.5 rounded-md bg-muted text-primary font-mono text-sm border border-border/50"
                  >
                    {inlinePart.slice(1, -1)}
                  </code>
                );
              }
              return <span key={inlineIndex}>{inlinePart}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
}

// Simple markdown-like renderer for answers
export function MarkdownContent({ content }: { content: string }) {
  return <CodeBlock content={content} className="text-sm whitespace-pre-wrap leading-relaxed" />;
}