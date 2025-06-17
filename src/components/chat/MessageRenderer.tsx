
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageRendererProps {
  content: string;
  role: 'user' | 'assistant';
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content, role }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const downloadCode = (code: string, filename: string = 'code.txt') => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Parse content for code blocks and regular text
  const parseContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/);
    
    return parts.map((part, index) => {
      // Multi-line code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0].trim() || 'text';
        const code = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="my-3 relative">
            <div className="flex items-center justify-between bg-muted px-3 py-2 text-sm font-medium rounded-t-lg border">
              <span className="text-muted-foreground">{language}</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(code)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadCode(code, `code.${language === 'text' ? 'txt' : language}`)}
                  className="h-6 px-2"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <pre className="bg-black/5 dark:bg-black/20 p-3 rounded-b-lg overflow-x-auto border border-t-0">
              <code className="text-sm font-mono">{code}</code>
            </pre>
          </div>
        );
      }
      
      // Inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code 
            key={index} 
            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
          >
            {code}
          </code>
        );
      }
      
      // Regular text with line breaks
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="message-content">
      {parseContent(content)}
    </div>
  );
};
