import React from 'https://aistudiocdn.com/react@^19.1.1';

export const InitialState = () => {
  return (
    React.createElement("div", { className: "text-center p-8 bg-slate-800/30 border border-slate-700 rounded-lg" },
      React.createElement("h2", { className: "text-2xl font-bold text-slate-200" }, "Ready to Analyze?"),
      React.createElement("p", { className: "mt-2 text-slate-400" },
        "Click the \"Analyze Page Content\" button to scan the current webpage for legal text and check it for potential issues."
      )
    )
  );
};