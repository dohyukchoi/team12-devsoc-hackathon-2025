import React from 'react';

export const InitialState: React.FC = () => {
  return (
    <div className="text-center p-8 bg-slate-800/30 border border-slate-700 rounded-lg">
      <h2 className="text-2xl font-bold text-slate-200">Ready to Analyze?</h2>
      <p className="mt-2 text-slate-400">
        Click the "Analyze Page Content" button to scan the current webpage for legal text and check it for potential issues.
      </p>
    </div>
  );
};
