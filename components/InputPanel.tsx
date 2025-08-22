import React, { useState } from 'react';
import { SparklesIcon, GitBranchIcon, AlertTriangleIcon } from './Icons';
import { MODELS } from '../constants';
import { importRepoToString } from '../services/githubService';
import type { AppStatus, Model, Provider } from '../types';

interface InputPanelProps {
  userInput: string;
  setUserInput: (value: string) => void;
  selectedProvider: Provider;
  setSelectedProvider: (provider: Provider) => void;
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  handleGenerate: () => void;
  status: AppStatus;
}

type InputMode = 'manual' | 'github';

const InputPanel: React.FC<InputPanelProps> = ({
  userInput,
  setUserInput,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  handleGenerate,
  status,
}) => {
  const isLoading = status === 'loading' || status === 'streaming';
  const [inputMode, setInputMode] = useState<InputMode>('manual');

  const [repoUrl, setRepoUrl] = useState<string>('');
  const [repoLoadingMessage, setRepoLoadingMessage] = useState<string>('');
  const [repoError, setRepoError] = useState<string>('');
  const [repoSuccess, setRepoSuccess] = useState<string>('');


  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = MODELS.find(m => m.id === e.target.value);
    if (model) {
      setSelectedModel(model.id);
      setSelectedProvider(model.provider);
    }
  };

  const handleLoadRepo = async () => {
    if (!repoUrl) {
      setRepoError('Please enter a GitHub repository URL.');
      return;
    }
    setRepoLoadingMessage('Initializing import...');
    setRepoError('');
    setRepoSuccess('');
    setUserInput('');

    try {
      const { content, fileCount, repoName } = await importRepoToString(
        repoUrl,
        (message) => setRepoLoadingMessage(message)
      );
      setUserInput(content);
      setRepoSuccess(`Successfully loaded ${fileCount} files from ${repoName}. Ready for analysis.`);
      setInputMode('manual');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setRepoError(`Failed to import repository: ${errorMessage}`);
    } finally {
      setRepoLoadingMessage('');
    }
  };


  const TabButton: React.FC<{ mode: InputMode; label: string }> = ({ mode, label }) => (
    <button
      onClick={() => {
        setInputMode(mode);
        setRepoError('');
        setRepoSuccess('');
      }}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        inputMode === mode
          ? 'border-b-2 border-blue-500 text-slate-100'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 border-b border-slate-800">
         <div className="-mb-px flex space-x-2">
            <TabButton mode="manual" label="Manual Input" />
            <TabButton mode="github" label="Import from GitHub" />
        </div>
      </div>
      
      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        {inputMode === 'manual' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-slate-200">Input Artifacts</h2>
            <p className="text-sm text-slate-400">
              Provide requirements, code snippets, architecture diagrams, or technical challenges for analysis.
            </p>
            {repoSuccess && (
              <div className="p-3 bg-teal-500/10 text-teal-300 border border-teal-900/50 rounded-md text-sm">
                {repoSuccess}
              </div>
            )}
            <div className="flex-grow flex flex-col min-h-[250px] sm:min-h-[300px]">
              <textarea
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  if (repoSuccess) setRepoSuccess('');
                }}
                placeholder="Paste your code, design document, or requirements here..."
                className="w-full flex-grow bg-slate-800/50 border border-slate-700 rounded-md p-3 text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-0 resize-none font-mono text-sm transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {inputMode === 'github' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-slate-200">Import from GitHub</h2>
            <p className="text-sm text-slate-400">
              Enter the URL of a <span className="font-semibold text-amber-400">public</span> GitHub repository to analyze its codebase.
            </p>
            <div>
              <label htmlFor="repo-url" className="block text-sm font-medium text-slate-300 mb-1">
                Repository URL
              </label>
              <input
                type="text"
                id="repo-url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-md p-2 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors"
                disabled={!!repoLoadingMessage}
              />
            </div>
            <button
              onClick={handleLoadRepo}
              disabled={!!repoLoadingMessage || isLoading}
              className="w-full flex items-center justify-center p-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500"
            >
              {repoLoadingMessage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {repoLoadingMessage}
                </>
              ) : (
                <>
                  <GitBranchIcon className="h-5 w-5 mr-2" />
                  Load Files
                </>
              )}
            </button>

            {repoError && (
              <div className="p-3 bg-red-500/10 text-red-300 border border-red-900/50 rounded-md text-sm flex items-start space-x-2">
                <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
                <span>{repoError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-800 space-y-4">
        <div>
          <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1">
            Model
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={handleModelChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors"
            disabled={isLoading}
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        </div>
      
        <button
          onClick={handleGenerate}
          disabled={isLoading || !userInput.trim()}
          className="w-full flex items-center justify-center p-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-blue-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;