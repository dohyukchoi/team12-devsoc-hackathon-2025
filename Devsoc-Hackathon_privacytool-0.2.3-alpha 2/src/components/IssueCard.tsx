import React from 'react';
import type { PolicyIssue } from '../types';
import { Severity } from '../types';

interface IssueCardProps {
  issue: PolicyIssue;
}

const getSeverityStyles = (severity: Severity): { bg: string; text: string; border: string } => {
  switch (severity) {
    case Severity.High:
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
    case Severity.Medium:
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    case Severity.Low:
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    default:
      return { bg: 'bg-slate-700/20', text: 'text-slate-400', border: 'border-slate-700/30' };
  }
};

const ExclamationTriangleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
);


export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { bg, text, border } = getSeverityStyles(issue.severity);

  return (
    <div className={`border ${border} ${bg} rounded-lg p-6 shadow-md transition-shadow hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-100 flex items-center">
            <ExclamationTriangleIcon />
            {issue.issueType}
        </h3>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${text} ${bg}`}>
          {issue.severity} Severity
        </span>
      </div>
      <p className="text-slate-300 mb-4">{issue.summary}</p>
      <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 bg-slate-800/50 p-3 rounded-r-md">
        "{issue.quote}"
      </blockquote>
    </div>
  );
};