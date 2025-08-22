import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import remarkGfm from 'https://esm.sh/remark-gfm@4';
import { SparklesIcon, AlertTriangleIcon } from './Icons';
import Card from './Card';
import InteractiveTable from './InteractiveTable';
import type { AppStatus, TableData, TableRow, AnalysisSection } from '../types';

interface AnalysisDisplayProps {
  content: string;
  status: AppStatus;
  detailedSections: AnalysisSection[];
  setAssessmentSections: (sections: AnalysisSection[]) => void;
  setDetailedSections: (sections: AnalysisSection[]) => void;
}

const INTERACTIVE_TABLE_SECTIONS = [
  '✅ Verified Specifications/Components',
  '⚠️ Identified Issues, Risks & Suggested Improvements',
  '💡 Potential Optimizations/Integrations:',
  '🛠️ Assessment of Resources & Tools:',
];

const ASSESSMENT_SECTION_TITLES = [
  'Core Assessment',
  'Expanded Analysis',
  'What is the stated goal or problem this system/component addresses?',
  'What are the key strengths of the current design/proposal?',
  'What are the primary concerns or weaknesses identified?',
  'What are the major risks associated with this system/component or proposal?',
  'What recommendations are made to address concerns and mitigate risks?',
  'What is the larger architectural or project context?'
];

const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-16 bg-slate-800 rounded-lg w-full"></div>
    <div className="h-48 bg-slate-800 rounded-lg w-full"></div>
    <div className="h-32 bg-slate-800 rounded-lg w-full"></div>
    <div className="h-40 bg-slate-800 rounded-lg w-full"></div>
  </div>
);

const EmptyState = () => (
  <div className="text-center text-slate-600 flex flex-col items-center justify-center h-full p-8">
    <SparklesIcon className="h-16 w-16 mb-4 text-slate-700"/>
    <h3 className="text-xl font-medium text-slate-400">Analysis Output</h3>
    <p>Your generated SIFT analysis will appear here.</p>
  </div>
);

const parseMarkdownTable = (markdown: string): TableData | null => {
    const lines = markdown.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return null;

    const headerLine = lines[0];
    const separatorLine = lines[1];

    if (!separatorLine.match(/\|.*-.*\|/)) return null;

    const headers = headerLine
        .split('|')
        .map(h => h.trim())
        .filter(Boolean);

    const rows: TableRow[] = lines.slice(2).map(line => {
        const cells = line
            .split('|')
            .map(c => c.trim())
            .filter((c, i, arr) => i > 0 && i < arr.length - 1); // Remove first and last empty cells from split

        const row: TableRow = {};
        headers.forEach((header, index) => {
            row[header] = cells[index] || '';
        });
        return row;
    }).filter(row => Object.values(row).some(cell => cell.trim() !== ''));

    if (headers.length === 0 || rows.length === 0) return null;

    return { headers, rows };
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
  content, 
  status, 
  detailedSections, 
  setAssessmentSections, 
  setDetailedSections 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'idle' && content) {
      // Split by markdown horizontal rules (***, ---, ___) or by any markdown header (##, ###, etc.)
      const rawSections = content.split(/\n\s*(?:\*|-|_){3,}\s*\n|\n(?=##+\s)/);

      const parsedSections: AnalysisSection[] = rawSections
        .map(chunk => chunk.trim())
        .filter(Boolean)
        .map(chunk => {
          const lines = chunk.split('\n');
          // Find the first line that is a markdown header
          const titleLine = lines.find(line => line.match(/^##+\s/)) || '';
          const sectionContent = chunk.replace(titleLine, '').trim();
          
          // Clean the markdown characters from the title
          const cleanTitle = titleLine.replace(/^##+\s*/, '').trim();
          
          const isTable = INTERACTIVE_TABLE_SECTIONS.some(tableHeader => 
            cleanTitle.startsWith(tableHeader)
          );

          return {
            title: cleanTitle,
            content: sectionContent,
            isTable: isTable,
          };
        }).filter(s => s.title);
      
      const assessment: AnalysisSection[] = [];
      const detailed: AnalysisSection[] = [];

      parsedSections.forEach(section => {
        if (ASSESSMENT_SECTION_TITLES.includes(section.title)) {
          assessment.push(section);
        } else {
          detailed.push(section);
        }
      });
      
      setAssessmentSections(assessment);
      setDetailedSections(detailed);

    } else if (status !== 'idle') {
      setAssessmentSections([]);
      setDetailedSections([]);
    }

    if (status === 'streaming' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, status, setAssessmentSections, setDetailedSections]);
  
  const getIconForTitle = (title: string): React.ReactNode | undefined => {
      if (title.startsWith('⚠️')) return <AlertTriangleIcon className="w-5 h-5" />;
      if (title.startsWith('💡')) return <SparklesIcon className="w-5 h-5" />;
      return undefined;
  };

  const renderContent = () => {
    if (status === 'loading') {
      return <SkeletonLoader />;
    }
    
    if (status === 'streaming') {
        return (
            <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
                {content}
            </ReactMarkdown>
        );
    }

    if (status === 'idle' && detailedSections.length > 0) {
      return (
        <div className="space-y-6">
          {detailedSections.map((section) => {
            const { title, content, isTable } = section;
            return (
              <Card key={title} title={title} icon={getIconForTitle(title)}>
                {isTable ? (
                  (() => {
                    const tableData = parseMarkdownTable(content);
                    return tableData ? (
                      <InteractiveTable tableData={tableData} />
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
                        {`_Could not parse table data._\n\n${content}`}
                      </ReactMarkdown>
                    );
                  })()
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
                    {content}
                  </ReactMarkdown>
                )}
              </Card>
            );
          })}
        </div>
      );
    }
    
    if (status === 'idle' && !content) {
      return <EmptyState />;
    }

    // Fallback for raw content if no sections are parsed
    return (
       <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none">
        {content}
      </ReactMarkdown>
    );
  };
  
  return (
    <div ref={scrollRef} className="flex-grow p-6 sm:p-8 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default AnalysisDisplay;