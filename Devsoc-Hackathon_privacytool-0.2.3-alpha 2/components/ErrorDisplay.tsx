
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg text-center" role="alert">
      <p className="font-bold">An Error Occurred</p>
      <p>{message}</p>
    </div>
  );
};
