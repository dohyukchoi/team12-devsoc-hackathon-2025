import React, { useState } from 'react';

interface ApiKeySetupProps {
  onKeySave: (apiKey: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeySave }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API Key cannot be empty.');
      return;
    }
    setError(null);
    onKeySave(apiKey.trim());
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700 text-center">
      <h2 className="text-2xl font-bold text-slate-100">Setup Gemini API Key</h2>
      <p className="mt-2 text-slate-400">
        To use this extension, you need to provide your own Gemini API key.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        You can get a free key from{' '}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          Google AI Studio
        </a>
        .
      </p>

      <div className="mt-6">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
          aria-label="Gemini API Key"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="w-full px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 transition-all duration-300 ease-in-out"
        >
          Save Key & Continue
        </button>
      </div>
    </div>
  );
};
