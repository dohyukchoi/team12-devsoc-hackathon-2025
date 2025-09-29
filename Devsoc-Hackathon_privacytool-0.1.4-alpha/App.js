import React from 'https://aistudiocdn.com/react@^19.1.1';
import { Header } from './components/Header.js';
import { AnalyzeButton } from './components/AnalyzeButton.js';
import { LoadingSpinner } from './components/LoadingSpinner.js';
import { ResultsDisplay } from './components/ResultsDisplay.js';
import { InitialState } from './components/InitialState.js';
import { ErrorDisplay } from './components/ErrorDisplay.js';
import { analyzePolicyText } from './services/geminiService.js';
import { ApiKeySetup } from './components/ApiKeySetup.js';

const { useState, useCallback, useEffect } = React;

const App = () => {
  const [apiKey, setApiKey] = useState(null);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if running inside a Chrome extension to avoid ReferenceError
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
          setApiKey(result.geminiApiKey);
          setIsKeySaved(true);
        } else {
          setIsKeySaved(false);
        }
      });
    } else {
        // Not in an extension environment, proceed without a stored key.
        setIsKeySaved(false);
    }
  }, []);

  const handleKeySave = (key) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ geminiApiKey: key }, () => {
        setApiKey(key);
        setIsKeySaved(true);
        setError(null);
      });
    } else {
      setError("Could not save API key. Chrome storage is not available.");
    }
  };

  const handleChangeKey = () => {
    setIsKeySaved(false);
    setAnalysisResult(null);
    setError(null);
  };

  const startAnalysis = useCallback(async (text) => {
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
      const messageListener = (message) => {
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

  return React.createElement("div", { className: "min-h-full bg-slate-900 text-slate-100 font-sans flex flex-col p-4" },
    React.createElement("div", { className: "w-full max-w-4xl mx-auto" },
      React.createElement(Header, null),
      React.createElement("main", { className: "mt-6" },
        !isKeySaved ? (
          React.createElement(ApiKeySetup, { onKeySave: handleKeySave })
        ) : (
          React.createElement(React.Fragment, null,
            React.createElement("div", { className: "bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700" },
              React.createElement("div", { className: "flex flex-col items-center space-y-4" },
                React.createElement(AnalyzeButton, { onClick: handleAnalyzeClick, isLoading: isLoading }),
                React.createElement("button", {
                  onClick: handleChangeKey,
                  className: "text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                }, "Change API Key")
              )
            ),
            React.createElement("div", { className: "mt-8" },
              isLoading && React.createElement(LoadingSpinner, null),
              error && React.createElement(ErrorDisplay, { message: error }),
              !isLoading && !error && analysisResult && React.createElement(ResultsDisplay, { result: analysisResult }),
              !isLoading && !error && !analysisResult && React.createElement(InitialState, null)
            )
          )
        )
      )
    )
  );
};

export default App;