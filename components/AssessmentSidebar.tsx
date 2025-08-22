import React from 'react';
import Card from './Card';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import remarkGfm from 'https://esm.sh/remark-gfm@4';
import type { AnalysisSection } from '../types';

interface AssessmentSidebarProps {
  sections: AnalysisSection[];
}

const AssessmentSidebar: React.FC<AssessmentSidebarProps> = ({ sections }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800">
        <h2 className="text-lg font-medium text-slate-200">Assessment Sidebar</h2>
      </div>
      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        {sections.length > 0 ? (
          sections.map((section) => (
            <Card key={section.title} title={section.title}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
                {section.content}
              </ReactMarkdown>
            </Card>
          ))
        ) : (
          <div className="pt-8 text-center text-slate-500">
            <p>No assessment summary available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentSidebar;
