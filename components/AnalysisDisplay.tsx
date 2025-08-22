
import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import remarkGfm from 'https://esm.sh/remark-gfm@4';
import { SparklesIcon } from './Icons';
import InteractiveTable from './InteractiveTable';
import type { AppStatus, TableData } from '../types';

interface AnalysisDisplayProps {
  content: string;
  status: AppStatus;
}

const INTERACTIVE_TABLE_SECTIONS = [
  '💡 Potential Optimizations/Integrations:',
  '🛠️ Assessment of Resources & Tools:',
];

// Helper to parse a markdown table string into a structured object
const parseMarkdownTable = (tableString: string): TableData | null => {
  const lines = tableString.trim().split('\n');
  if (lines.length < 2) return null;

  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
  const rows = lines.slice(2).map(line => {
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = cells[index] || '';
    });
    return rowData;
  });

  return { headers, rows };
};


const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-800 rounded-md w-1/3"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-800 rounded-md w-full"></div>
      <div className="h-4 bg-slate-800 rounded-md w-5/6"></div>
    </div>
    <div className="h-6 bg-slate-800 rounded-md w-1/4"></div>
    <div className="h-32 bg-slate-800 rounded-md w-full"></div>
    <div className="h-6 bg-slate-800 rounded-md w-1/4"></div>
    <div className="h-24 bg-slate-800 rounded-md w-full"></div>
  </div>
);

const EmptyState = () => (
  <div className="text-center text-slate-600 flex flex-col items-center justify-center h-full p-8">
    <SparklesIcon className="h-16 w-16 mb-4 text-slate-700"/>
    <h3 className="text-xl font-medium text-slate-400">Analysis Output</h3>
    <p>Your generated SIFT analysis will appear here.</p>
  </div>
);

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ content, status }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState(content);
  const [interactiveTables, setInteractiveTables] = useState<Record<string, TableData>>({});

  useEffect(() => {
    // Only process the content when the streaming is done to avoid re-rendering on each chunk.
    if (status === 'idle' && content) {
      let tempContent = content;
      const newTables: Record<string, TableData> = {};
      let tableIndex = 0;

      INTERACTIVE_TABLE_SECTIONS.forEach(header => {
        const sectionRegex = new RegExp(`(### ${header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?)(?=\\n###|$)`);
        const sectionMatch = tempContent.match(sectionRegex);
        if (!sectionMatch) return;

        const section = sectionMatch[0];
        const tableRegex = /(\|[^\n]+\|\r?\n\|[ \t-:]+\|\r?\n(?:\|[^\n]+\|\r?\n?)*)/g;
        const tableMatch = section.match(tableRegex);

        if (tableMatch) {
          const tableMarkdown = tableMatch[0];
          const parsedTable = parseMarkdownTable(tableMarkdown);
          if (parsedTable) {
            const tableId = `interactive-table-${tableIndex++}`;
            newTables[tableId] = parsedTable;
            tempContent = tempContent.replace(tableMarkdown, `<div id="${tableId}"></div>`);
          }
        }
      });
      
      setInteractiveTables(newTables);
      setProcessedContent(tempContent);
    } else if (status === 'streaming') {
      // While streaming, just show the raw content
      setProcessedContent(content);
      setInteractiveTables({});
    }
  }, [content, status]);


  useEffect(() => {
    if (status === 'streaming' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [processedContent, status]);

  const renderContent = () => {
    if (status === 'loading') {
      return <SkeletonLoader />;
    }
    if (status === 'idle' && !content) {
      return <EmptyState />;
    }
    return (
       <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose prose-invert max-w-none"
        components={{
            div: ({ node, ...props }) => {
                const id = props.id as string;
                if (id && interactiveTables[id]) {
                    return <InteractiveTable tableData={interactiveTables[id]} />;
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return <div {...props} />;
            },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    );
  };
  
  return (
    <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default AnalysisDisplay;
