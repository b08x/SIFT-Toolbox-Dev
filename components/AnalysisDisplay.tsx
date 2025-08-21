
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import remarkGfm from 'https://esm.sh/remark-gfm@4';
import { SparklesIcon } from './Icons';
import type { AppStatus } from '../types';

interface AnalysisDisplayProps {
  content: string;
  status: AppStatus;
}

const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-700 rounded-md w-1/3"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded-md w-full"></div>
      <div className="h-4 bg-gray-700 rounded-md w-5/6"></div>
    </div>
    <div className="h-6 bg-gray-700 rounded-md w-1/4"></div>
    <div className="h-32 bg-gray-700 rounded-md w-full"></div>
    <div className="h-6 bg-gray-700 rounded-md w-1/4"></div>
    <div className="h-24 bg-gray-700 rounded-md w-full"></div>
  </div>
);

const EmptyState = () => (
  <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
    <SparklesIcon className="h-16 w-16 mb-4 text-gray-600"/>
    <h3 className="text-xl font-semibold text-gray-300">Analysis Output</h3>
    <p>Your generated SIFT analysis will appear here.</p>
  </div>
);

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ content, status }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

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
      >
        {content}
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
