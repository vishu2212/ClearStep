import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

export const CorruptionAlert: React.FC = () => {
  const { recoveredFromCorrupt, clearCorruptionAlert } = usePreferences();

  if (!recoveredFromCorrupt) return null;

  return (
    <div
      role="alert"
      className="bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-900 px-4 py-3"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Safe Storage Recovery:</strong> Some previous local storage data could not be parsed. It has been
            safely preserved in a local backup slot without data loss, and defaults were restored.
          </span>
        </div>
        <button
          type="button"
          onClick={clearCorruptionAlert}
          aria-label="Dismiss storage alert"
          className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
