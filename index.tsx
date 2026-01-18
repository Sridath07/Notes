
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("NoteVault Initializing...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found!");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("NoteVault Rendered successfully.");
}
