
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalyzeButton } from './components/AnalyzeButton';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultsDisplay } from './components/ResultsDisplay';
import { InitialState } from './components/InitialState';
import { ErrorDisplay } from './components/ErrorDisplay';
import { analyzePolicyText } from './services/geminiService';
import type { AnalysisResult } from './types';

// Fix: Add a declaration for the chrome object to satisfy TypeScript for browser extension APIs.
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
    // The listener for content script messages
    if (window.chrome && chrome.runtime && chrome.runtime.onMessage) {
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

    if (!(window.chrome && chrome.tabs && chrome.scripting)) {
      setError("This must be run as a Chrome extension.");
      setIsLoading(false);
      console.warn("Chrome scripting API not available.");
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // This function is injected into the active tab
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
        console.error("Error injecting script or querying tabs:", err);
        setError(err instanceof Error ? `Error: ${err.message}` : "Failed to access page content. Please try again on a different page.");
        setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 font-sans flex flex-col p-4">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700">
            <div className="flex justify-center">
              <AnalyzeButton onClick={handleAnalyzeClick} isLoading={isLoading} />
            </div>
          </div>

          <div className="mt-8">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorDisplay message={error} />}
            {!isLoading && !error && analysisResult && <ResultsDisplay result={analysisResult} />}
            {!isLoading && !error && !analysisResult && <InitialState />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;