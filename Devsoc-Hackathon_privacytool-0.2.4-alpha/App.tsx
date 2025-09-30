import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalyzeButton } from './components/AnalyzeButton';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultsDisplay } from './components/ResultsDisplay';
import { InitialState } from './components/InitialState';
import { ErrorDisplay } from './components/ErrorDisplay';
import { analyzePolicyText } from './services/geminiService';
import type { AnalysisResult } from './types';

declare const chrome: any;

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const startAnalysis = useCallback(async (text: string) => {
    if (!text || !text.trim()) {
      setError('Could not retrieve any text from the page. The page might be empty or protected.');
      setIsLoading(false);
      return;
    }

    try {
      // FIX: The API key is now handled in the service layer, following best practices.
      const result = await analyzePolicyText(text);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      const messageListener = (message: { type: string; content?: string }) => {
        if (message.type === 'PAGE_CONTENT' && typeof message.content === 'string') {
          startAnalysis(message.content);
        }
      };
      chrome.runtime.onMessage.addListener(messageListener);
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, [startAnalysis]);

  const handleAnalyzeClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    if (!(typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting)) {
      setError("This must be run as a Chrome extension.");
      setIsLoading(false);
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            chrome.runtime.sendMessage({
              type: "PAGE_CONTENT",
              content: document.body.innerText
            });
          },
        });
      } else {
        throw new Error("Could not find an active tab.");
      }
    } catch (err) {
      console.error("Error injecting script:", err);
      setError(err instanceof Error ? `Error: ${err.message}` : "Failed to access page content.");
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 font-sans flex flex-col p-4">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-6">
          {/* FIX: Removed API key setup UI to align with security best practices. */}
            <>
              <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700">
                <div className="flex flex-col items-center space-y-4">
                    <AnalyzeButton onClick={handleAnalyzeClick} isLoading={isLoading} />
                </div>
              </div>

              <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay message={error} />}
                {!isLoading && !error && analysisResult && <ResultsDisplay result={analysisResult} />}
                {!isLoading && !error && !analysisResult && <InitialState />}
              </div>
            </>
        </main>
      </div>
    </div>
  );
};

export default App;
