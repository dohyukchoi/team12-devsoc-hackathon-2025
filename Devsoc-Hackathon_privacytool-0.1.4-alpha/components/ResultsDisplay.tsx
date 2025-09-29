
import React from 'react';
import type { AnalysisResult } from '../types';
import { IssueCard } from './IssueCard';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
);

const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result.isRelevant) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-6 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-2">Not a Legal Document</h2>
        <p>{result.relevanceReason}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="bg-slate-800 p-4 rounded-lg flex items-center text-slate-300">
            <InfoIcon />
            <span>{result.relevanceReason}</span>
        </div>

      {result.issues.length === 0 ? (
        <div className="bg-green-900/30 border border-green-700 text-green-200 p-6 rounded-lg text-center flex items-center justify-center">
            <CheckCircleIcon />
          <h2 className="text-2xl font-bold">No Major Issues Found</h2>
        </div>
      ) : (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-100">Potential Issues Found ({result.issues.length})</h2>
          {result.issues.map((issue, index) => (
            <IssueCard key={index} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};
