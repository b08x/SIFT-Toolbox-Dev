import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import AnalysisDisplay from './components/AnalysisDisplay';
import { streamAnalysis } from './services/geminiService';
import { MODELS } from './constants';
import type { AppStatus, Provider, Model } from './types';
import { AlertTriangleIcon } from './components/Icons';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string>('');

  const [selectedProvider, setSelectedProvider] = useState<Provider>(MODELS[0].provider);
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);

  const handleGenerate = useCallback(async () => {
    if (!userInput.trim()) return;

    setStatus('loading');
    setAnalysisResult('');
    setError('');

    await streamAnalysis(
      userInput,
      selectedModel,
      (chunk) => {
        if (status !== 'streaming') setStatus('streaming');
        setAnalysisResult((prev) => prev + chunk);
      },
      (err) => {
        setError(err);
        setStatus('error');
      },
      () => {
        setStatus('idle');
      }
    );
  }, [userInput, selectedModel, status]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-950 text-slate-200">
      <Header />
      <main className="flex flex-col md:flex-row flex-grow">
        <div className="w-full md:w-1/3 lg:w-[480px] flex-shrink-0 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900">
          <InputPanel
            userInput={userInput}
            setUserInput={setUserInput}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            handleGenerate={handleGenerate}
            status={status}
          />
        </div>
        <div className="w-full md:w-2/3 flex-grow flex flex-col bg-slate-900/50">
          <AnalysisDisplay content={analysisResult} status={status} />
          {status === 'error' && (
            <div className="p-4 border-t border-red-900/50 bg-red-500/10 text-red-300 flex items-start space-x-3">
              <AlertTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">An Error Occurred</p>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;