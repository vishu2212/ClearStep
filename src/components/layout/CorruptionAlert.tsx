import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

export const CorruptionAlert: React.FC = () => {
  const { recoveredFromCorrupt, clearCorruptionAlert } = usePreferences();

  if (!recoveredFromCorrupt) return null;

  return (
    <div
      role="alert"
      className="bg-warning-bg border-b border-warning/30 px-4 py-3"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 font-body-sm text-body-sm text-warning">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <span>
            <strong className="font-semibold">Safe Storage Recovery:</strong> Some previous local storage data could not be parsed. It has been
            safely preserved in a local backup slot without data loss, and defaults were restored.
          </span>
        </div>
        <button
          type="button"
          onClick={clearCorruptionAlert}
          aria-label="Dismiss storage alert"
          className="p-1 rounded hover:bg-warning/20 text-warning cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
