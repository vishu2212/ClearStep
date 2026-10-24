import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useTasks } from '../../context/TaskContext';
import { loadFromLocalStorage, exportBackupJson, importBackupJson, saveToLocalStorage } from '../../storage/localStorageRepo';
import { getInitialSeedData } from '../../storage/seedData';
import { Button } from '../common/Button';

export const SettingsView: React.FC = () => {
  const { preferences, updatePreferences, setTheme, resetPreferences } = usePreferences();
  const { reloadFromStorage } = useTasks();

  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleExport = () => {
    const store = loadFromLocalStorage().store;
    const jsonStr = exportBackupJson(store);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clearstep-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJson(content);
      if (res.success && res.store) {
        setImportStatus({ success: true, message: 'Backup imported successfully! Data refreshed.' });
        updatePreferences(res.store.preferences);
        reloadFromStorage();
      } else {
        setImportStatus({ success: false, message: res.error || 'Failed to parse backup.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToDemo = () => {
    if (confirm('Reset application to starter demonstration data? All current tasks will be replaced.')) {
      const initial = getInitialSeedData();
      saveToLocalStorage(initial);
      updatePreferences(initial.preferences);
      reloadFromStorage();
      setImportStatus({ success: true, message: 'Reset to sample demonstration data.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Preferences & Accessibility</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Tune ClearStep to match your sensory and focus rhythm. All settings persist locally.
        </p>
      </div>

      {importStatus && (
        <div
          role="status"
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2 ${
            importStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/70 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Timer Durations Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Focus & Break Intervals</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="focus-dur" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Focus Duration
            </label>
            <select
              id="focus-dur"
              value={preferences.focusDuration}
              onChange={(e) => updatePreferences({ focusDuration: Number(e.target.value) })}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value={15}>15 minutes (Gentle)</option>
              <option value={20}>20 minutes</option>
              <option value={25}>25 minutes (Standard)</option>
              <option value={45}>45 minutes (Deep)</option>
              <option value={60}>60 minutes (Intensive)</option>
            </select>
          </div>

          <div>
            <label htmlFor="short-break-dur" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Break
            </label>
            <select
              id="short-break-dur"
              value={preferences.shortBreakDuration}
              onChange={(e) => updatePreferences({ shortBreakDuration: Number(e.target.value) })}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value={3}>3 minutes</option>
              <option value={5}>5 minutes (Standard)</option>
              <option value={10}>10 minutes</option>
            </select>
          </div>

          <div>
            <label htmlFor="long-break-dur" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Long Break
            </label>
            <select
              id="long-break-dur"
              value={preferences.longBreakDuration}
              onChange={(e) => updatePreferences({ longBreakDuration: Number(e.target.value) })}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes (Standard)</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>
      </section>

      {/* Visual & Accessibility Options */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Appearance & Accessibility</span>
        </h2>

        <div className="space-y-4">
          {/* Theme Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Color Theme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred visual contrast mode</p>
            </div>
            <div className="flex items-center gap-2">
              {(['system', 'light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    preferences.theme === t
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Reduced Motion</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Disables all non-essential animations and transitions to prevent vestibular strain
              </p>
            </div>
            <input
              type="checkbox"
              id="reduced-motion-toggle"
              checked={preferences.reducedMotion}
              onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
          </div>

          {/* High Contrast Focus Outlines */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">High-Contrast Focus Rings</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enhances keyboard focus indicators with thick 3px blue borders and offsets
              </p>
            </div>
            <input
              type="checkbox"
              id="high-contrast-toggle"
              checked={preferences.highContrastFocus}
              onChange={(e) => updatePreferences({ highContrastFocus: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Local-First Data Sovereignty & Backup */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Data Ownership & Backups</span>
          </h2>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded">
            100% Offline
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Your tasks and focus records are stored strictly on your computer. You can export a full JSON backup to move between browsers or restore past work.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Backup (.json)
          </Button>

          {/* Import Button */}
          <label className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-within:ring-2 focus-within:ring-blue-600 text-xs px-3 py-1.5 gap-1.5 border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-sm cursor-pointer min-h-[36px]">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="sr-only"
            />
          </label>

          {/* Reset to Demo Data */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToDemo}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset to Sample Data
          </Button>
        </div>
      </section>

      {/* Factory Reset Defaults */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset preferences to default values?')) {
              resetPreferences();
            }
          }}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Restore default preferences
        </button>
      </div>
    </div>
  );
};
