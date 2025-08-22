import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import remarkGfm from 'https://esm.sh/remark-gfm@4';
import { SparklesIcon } from './Icons';
import type { AppStatus } from '../types';

interface AnalysisSection {
  title: string;
  content: string;
  isTable: boolean;
}

interface AnalysisDisplayProps {
  content: string;
  status: AppStatus;
}

const INTERACTIVE_TABLE_SECTIONS = [
  '💡 Potential Optimizations/Integrations:',
  '🛠️ Assessment of Resources & Tools:',
];

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
  const [sections, setSections] = useState<AnalysisSection[]>([]);

  useEffect(() => {
    // Only process the content into sections when streaming is complete.
    if (status === 'idle' && content) {
      const rawSections = content.split(/\n(?=###\s)/);

      const parsedSections: AnalysisSection[] = rawSections
        .map(chunk => chunk.trim())
        .filter(Boolean)
        .map(chunk => {
          const lines = chunk.split('\n');
          const titleLine = lines.shift() || '';
          const sectionContent = lines.join('\n');
          
          const cleanTitle = titleLine.replace(/^###\s*/, '').trim();
          
          const isTable = INTERACTIVE_TABLE_SECTIONS.some(tableHeader => 
            cleanTitle.startsWith(tableHeader)
          );

          return {
            title: cleanTitle,
            content: sectionContent,
            isTable: isTable,
          };
        });
      
      setSections(parsedSections);

    } else if (status !== 'idle') {
      // Clear sections when a new analysis starts or is in progress.
      setSections([]);
    }

    // Autoscroll during streaming
    if (status === 'streaming' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, status]);

  const renderContent = () => {
    if (status === 'loading') {
      return <SkeletonLoader />;
    }
    if (status === 'idle' && !content) {
      return <EmptyState />;
    }
    // For now, render the entire raw markdown content.
    // The parsed `sections` state is ready for the next step of rendering into cards.
    return (
       <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose prose-invert max-w-none"
      >
        {content}
      </ReactMarkdown>
    );
  };
  
  return (
    <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default AnalysisDisplay;