import React from 'react';

interface InlineMarkdownRendererProps {
  content: string;
}

export function InlineMarkdownRenderer({ content }: InlineMarkdownRendererProps) {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines
      if (!line.trim()) {
        continue;
      }

      // Headers (# ## ### ####)
      if (line.startsWith('#### ')) {
        elements.push(
          <div key={key++} className="text-sm font-semibold mb-1 mt-1 first:mt-0">
            {parseInline(line.substring(5))}
          </div>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <div key={key++} className="text-sm font-semibold mb-2 mt-2 first:mt-0">
            {parseInline(line.substring(4))}
          </div>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <div key={key++} className="text-base font-bold mb-2 mt-2 first:mt-0">
            {parseInline(line.substring(3))}
          </div>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <div key={key++} className="text-lg font-bold mb-2 mt-3 first:mt-0">
            {parseInline(line.substring(2))}
          </div>
        );
      }
      // Unordered list (- or *)
      else if (line.match(/^[\-\*]\s/)) {
        const items: string[] = [line.substring(2)];
        // Collect consecutive list items
        while (i + 1 < lines.length && lines[i + 1].match(/^[\-\*]\s/)) {
          i++;
          items.push(lines[i].substring(2));
        }
        elements.push(
          <ul key={key++} className="list-disc list-inside my-2 space-y-1 ml-2">
            {items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ul>
        );
      }
      // Ordered list (1. 2. etc)
      else if (line.match(/^\d+\.\s/)) {
        const items: string[] = [line.replace(/^\d+\.\s/, '')];
        // Collect consecutive list items
        while (i + 1 < lines.length && lines[i + 1].match(/^\d+\.\s/)) {
          i++;
          items.push(lines[i].replace(/^\d+\.\s/, ''));
        }
        elements.push(
          <ol key={key++} className="list-decimal list-inside my-2 space-y-1 ml-2">
            {items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      // Blockquote (>)
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={key++} className="border-l-2 border-current pl-3 py-1 my-2 opacity-90 italic">
            {parseInline(line.substring(2))}
          </blockquote>
        );
      }
      // Horizontal rule (--- or ***)
      else if (line.match(/^[\-\*]{3,}$/)) {
        elements.push(
          <hr key={key++} className="border-t border-current opacity-20 my-3" />
        );
      }
      // Code block (```)
      else if (line.startsWith('```')) {
        const codeLines: string[] = [];
        i++; // Skip the opening ```
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre key={key++} className="bg-black bg-opacity-10 p-3 rounded-lg my-2 overflow-x-auto">
            <code className="font-mono text-xs leading-relaxed">
              {codeLines.join('\n')}
            </code>
          </pre>
        );
      }
      // Regular paragraph
      else {
        elements.push(
          <div key={key++} className="mb-3 last:mb-0 leading-relaxed">
            {parseInline(line)}
          </div>
        );
      }
    }

    return elements;
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Process in order: links, bold, italic, code

    // Links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/;
    let linkMatch = linkRegex.exec(remaining);

    while (linkMatch) {
      // Add text before link
      if (linkMatch.index > 0) {
        parts.push(...parseFormatting(remaining.substring(0, linkMatch.index), key));
      }

      // Add link
      parts.push(
        <a
          key={`link-${key++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity"
        >
          {linkMatch[1]}
        </a>
      );

      remaining = remaining.substring(linkMatch.index + linkMatch[0].length);
      linkMatch = linkRegex.exec(remaining);
    }

    // Process remaining text for bold, italic, code
    if (remaining) {
      parts.push(...parseFormatting(remaining, key));
    }

    return parts.length > 0 ? parts : [text];
  };

  const parseFormatting = (text: string, startKey: number): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = startKey;

    // Inline code `code`
    const codeRegex = /`([^`]+)`/;
    let codeMatch = codeRegex.exec(remaining);

    while (codeMatch) {
      // Add text before code
      if (codeMatch.index > 0) {
        parts.push(...parseBoldItalic(remaining.substring(0, codeMatch.index), key));
      }

      // Add code
      parts.push(
        <code key={`code-${key++}`} className="bg-black bg-opacity-10 px-1.5 py-0.5 rounded text-xs font-mono">
          {codeMatch[1]}
        </code>
      );

      remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
      codeMatch = codeRegex.exec(remaining);
    }

    // Process remaining for bold/italic
    if (remaining) {
      parts.push(...parseBoldItalic(remaining, key));
    }

    return parts.length > 0 ? parts : [text];
  };

  const parseBoldItalic = (text: string, startKey: number): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = startKey;

    // Bold **text**
    const boldRegex = /\*\*([^\*]+)\*\*/;
    let boldMatch = boldRegex.exec(remaining);

    while (boldMatch) {
      // Add text before bold
      if (boldMatch.index > 0) {
        const beforeText = remaining.substring(0, boldMatch.index);
        parts.push(...parseItalic(beforeText, key));
      }

      // Add bold
      parts.push(
        <strong key={`bold-${key++}`} className="font-bold">
          {boldMatch[1]}
        </strong>
      );

      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      boldMatch = boldRegex.exec(remaining);
    }

    // Process remaining for italic
    if (remaining) {
      parts.push(...parseItalic(remaining, key));
    }

    return parts.length > 0 ? parts : [text];
  };

  const parseItalic = (text: string, startKey: number): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = startKey;

    // Italic *text* (but not **)
    const italicRegex = /(?<!\*)\*(?!\*)([^\*]+)\*(?!\*)/;
    let italicMatch = italicRegex.exec(remaining);

    while (italicMatch) {
      // Add text before italic
      if (italicMatch.index > 0) {
        parts.push(remaining.substring(0, italicMatch.index));
      }

      // Add italic
      parts.push(
        <em key={`italic-${key++}`} className="italic">
          {italicMatch[1]}
        </em>
      );

      remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
      italicMatch = italicRegex.exec(remaining);
    }

    // Add remaining text
    if (remaining) {
      parts.push(remaining);
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="text-sm leading-relaxed">
      {parseMarkdown(content)}
    </div>
  );
}
