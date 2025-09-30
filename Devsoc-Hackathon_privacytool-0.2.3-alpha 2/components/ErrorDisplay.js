import React from 'https://aistudiocdn.com/react@^19.1.1';

export const ErrorDisplay = ({ message }) => {
  return (
    React.createElement("div", { className: "bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg text-center", role: "alert" },
      React.createElement("p", { className: "font-bold" }, "An Error Occurred"),
      React.createElement("p", null, message)
    )
  );
};