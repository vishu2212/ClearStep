import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { PreferencesProvider } from './context/PreferencesContext';
import { TaskProvider } from './context/TaskContext';
import { TimerProvider } from './context/TimerContext';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element with id "root"');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <PreferencesProvider>
      <TaskProvider>
        <TimerProvider>
          <App />
        </TimerProvider>
      </TaskProvider>
    </PreferencesProvider>
  </React.StrictMode>
);
