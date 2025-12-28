import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
            <div key={index} className="my-4 rounded-lg overflow-hidden">
              {languageMatch && (
                <div className="bg-dark-700 px-4 py-2 text-xs text-muted-foreground font-mono border-b border-border/50">
                  {language}
                </div>
              )}
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'hsl(240 10% 6%)',
                  fontSize: '0.875rem',
                  borderRadius: languageMatch ? '0 0 0.5rem 0.5rem' : '0.5rem',
                }}
                showLineNumbers={code.split('\n').length > 3}
                wrapLines
              >
                {code}
              </SyntaxHighlighter>
            </div>
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
                    className="px-1.5 py-0.5 rounded bg-dark-700 text-primary font-mono text-sm"
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
  return <CodeBlock content={content} className="text-sm whitespace-pre-wrap" />;
}
