import React from 'react';

const ShieldIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12.001 2.25c-4.393 0-8.48.336-8.528 7.373-.042 6.208 4.35 9.773 7.828 11.835a2.25 2.25 0 0 0 1.402 0c3.478-2.062 7.87-5.627 7.828-11.835C20.48 2.586 16.392 2.25 12.001 2.25Zm.022 8.945a.75.75 0 0 1 1.05-.022l3.414 2.845a.75.75 0 1 1-.956 1.144l-2.42-2.016v4.098a.75.75 0 1 1-1.5 0v-4.098l-2.42 2.016a.75.75 0 1 1-.956-1.144l3.414-2.845a.75.75 0 0 1-.022-.022Z" clipRule="evenodd" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="text-center flex flex-col items-center">
        <ShieldIcon />
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mt-2">
        Policy Analyzer
      </h1>
      <p className="mt-4 text-lg text-slate-400 max-w-2xl">
        Navigate to a Privacy Policy or Terms of Service page, then click the button below. Our AI will analyze the page's content for potential issues.
      </p>
    </header>
  );
};