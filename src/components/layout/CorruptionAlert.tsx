import React from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useTasks } from '../../context/TaskContext';

export const CorruptionAlert: React.FC = () => {
  const { recoveredFromCorrupt, backupSuccess, clearCorruptionAlert } = usePreferences();
  const { persistenceError, clearPersistenceError } = useTasks();

  if (!recoveredFromCorrupt && !persistenceError) return null;

  return (
    <div className="flex flex-col gap-0">
      {recoveredFromCorrupt && (
        <div
          role="alert"
          className="bg-warning-bg border-b border-warning/30 px-4 py-3"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 font-body-sm text-body-sm text-warning">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <span>
                <strong className="font-semibold">Storage Recovery:</strong>{' '}
                {backupSuccess
                  ? 'Some previous local storage data could not be parsed. It has been safely preserved in a local backup slot without data loss, and defaults were restored.'
                  : 'Previous local storage data could not be parsed and the backup slot could not be written (storage may be full). Defaults were restored.'}
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
      )}

      {persistenceError && (
        <div
          role="alert"
          className="bg-danger-bg border-b border-danger/30 px-4 py-3"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 font-body-sm text-body-sm text-danger">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <span>
                <strong className="font-semibold">Storage Warning:</strong> {persistenceError}
              </span>
            </div>
            <button
              type="button"
              onClick={clearPersistenceError}
              aria-label="Dismiss storage warning"
              className="p-1 rounded hover:bg-danger/20 text-danger cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
