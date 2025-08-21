
import React from 'react';
import { SparklesIcon } from './Icons';
import { MODELS } from '../constants';
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
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = MODELS.find(m => m.id === e.target.value);
    if (model) {
      setSelectedModel(model.id);
      setSelectedProvider(model.provider);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 p-4 space-y-4">
      <h2 className="text-xl font-semibold text-white">Input Artifacts</h2>
      <p className="text-sm text-gray-400">
        Provide requirements, code snippets, architecture diagrams, or technical challenges for analysis.
      </p>
      
      <div className="flex-grow flex flex-col">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Paste your code, design document, or requirements here..."
          className="w-full flex-grow bg-gray-900/70 border border-gray-700 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-4">
         <div className="flex-grow">
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-1">
            Model
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={handleModelChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={isLoading}
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={isLoading || !userInput.trim()}
        className="w-full flex items-center justify-center p-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
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
  );
};

export default InputPanel;
