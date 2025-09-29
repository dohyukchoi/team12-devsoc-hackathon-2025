import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalyzeButton } from './components/AnalyzeButton';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultsDisplay } from './components/ResultsDisplay';
import { InitialState } from './components/InitialState';
import { ErrorDisplay } from './components/ErrorDisplay';
import { analyzePolicyText } from './services/geminiService';
import { ApiKeySetup } from './components/ApiKeySetup';
import type { AnalysisResult } from './types';

declare const chrome: any;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On load, check if an API key is already stored.
    // Use `typeof chrome` check to prevent ReferenceError if not in an extension context
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['geminiApiKey'], (result: { geminiApiKey?: string }) => {
        if (result.geminiApiKey) {
          setApiKey(result.geminiApiKey);
          setIsKeySaved(true);
        } else {
            setIsKeySaved(false); // Explicitly set to false to show setup
        }
      });
    } else {
        // Not in an extension, default to showing the setup screen.
        setIsKeySaved(false);
    }
  }, []);

  const handleKeySave = (key: string) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ geminiApiKey: key }, () => {
        setApiKey(key);
        setIsKeySaved(true);
        setError(null); // Clear previous errors
      });
    } else {
        setError("Could not save API key. Chrome storage is not available.")
    }
  };

  const handleChangeKey = () => {
    setIsKeySaved(false);
    setAnalysisResult(null);
    setError(null);
  };
  
  const startAnalysis = useCallback(async (text: string) => {
    if (!apiKey) {
      setError("Gemini API key is not set. Please set it first.");
      setIsLoading(false);
      return;
    }

    if (!text || !text.trim()) {
      setError('Could not retrieve any text from the page. The page might be empty or protected.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await analyzePolicyText(text, apiKey);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (isKeySaved && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
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
  }, [startAnalysis, isKeySaved]);

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
          {!isKeySaved ? (
            <ApiKeySetup onKeySave={handleKeySave} />
          ) : (
            <>
              <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700">
                <div className="flex flex-col items-center space-y-4">
                    <AnalyzeButton onClick={handleAnalyzeClick} isLoading={isLoading} />
                    <button 
                        onClick={handleChangeKey} 
                        className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                        Change API Key
                    </button>
                </div>
              </div>

              <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay message={error} />}
                {!isLoading && !error && analysisResult && <ResultsDisplay result={analysisResult} />}
                {!isLoading && !error && !analysisResult && <InitialState />}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;