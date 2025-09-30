import React from 'https://aistudiocdn.com/react@^19.1.1';
import ReactDOM from 'https://aistudiocdn.com/react-dom@^19.1.1/client';
import App from './App.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null, React.createElement(App, null))
);