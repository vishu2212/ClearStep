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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand" />
          <span>Make ClearStep yours</span>
          <span className="sr-only">Preferences & Accessibility</span>
        </h1>
        <p className="font-body-md text-body-md text-text-secondary mt-1">
          Personalize your focus sessions, accessibility, and data preferences.
        </p>
      </div>

      {importStatus && (
        <div
          role="status"
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2 ${
            importStatus.success
              ? 'bg-success-bg text-success border border-success/30'
              : 'bg-danger-bg text-danger border border-danger/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Timer Durations Section */}
      <section className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="font-headline-sm text-headline-sm font-semibold text-text-primary flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand" />
          <span>Focus & Break Intervals</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="focus-dur" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
              Focus Duration
            </label>
            <select
              id="focus-dur"
              value={preferences.focusDuration}
              onChange={(e) => updatePreferences({ focusDuration: Number(e.target.value) })}
              className="w-full font-body-md text-body-md px-3 py-2 rounded-xl border border-border-subtle/40 bg-white bg-bg-surface text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <option value={15}>15 minutes (Gentle)</option>
              <option value={20}>20 minutes</option>
              <option value={25}>25 minutes (Standard)</option>
              <option value={45}>45 minutes (Deep)</option>
              <option value={60}>60 minutes (Intensive)</option>
            </select>
          </div>

          <div>
            <label htmlFor="short-break-dur" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
              Short Break
            </label>
            <select
              id="short-break-dur"
              value={preferences.shortBreakDuration}
              onChange={(e) => updatePreferences({ shortBreakDuration: Number(e.target.value) })}
              className="w-full font-body-md text-body-md px-3 py-2 rounded-xl border border-border-subtle/40 bg-white bg-bg-surface text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <option value={3}>3 minutes</option>
              <option value={5}>5 minutes (Standard)</option>
              <option value={10}>10 minutes</option>
            </select>
          </div>

          <div>
            <label htmlFor="long-break-dur" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
              Long Break
            </label>
            <select
              id="long-break-dur"
              value={preferences.longBreakDuration}
              onChange={(e) => updatePreferences({ longBreakDuration: Number(e.target.value) })}
              className="w-full font-body-md text-body-md px-3 py-2 rounded-xl border border-border-subtle/40 bg-white bg-bg-surface text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{ backgroundColor: '#FFFFFF' }}
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
      <section className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="font-headline-sm text-headline-sm font-semibold text-text-primary flex items-center gap-2">
          <Eye className="w-4 h-4 text-brand" />
          <span>Appearance & Accessibility</span>
        </h2>

        <div className="space-y-4">
          {/* Theme Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-subtle/20">
            <div>
              <p className="font-title-sm text-title-sm font-semibold text-text-primary">Color Theme</p>
              <p className="font-body-sm text-body-sm text-text-secondary">Choose your preferred visual contrast mode</p>
            </div>
            <div className="flex items-center gap-2">
              {(['system', 'light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold capitalize transition-all cursor-pointer ${
                    preferences.theme === t
                      ? 'bg-brand text-brand-on shadow-sm'
                      : 'bg-bg-sunken text-text-secondary hover:bg-border-subtle/40 hover:text-text-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-border-subtle/20">
            <div>
              <p className="font-title-sm text-title-sm font-semibold text-text-primary">Reduced Motion</p>
              <p className="font-body-sm text-body-sm text-text-secondary">
                Disables all non-essential animations and transitions to prevent vestibular strain
              </p>
            </div>
            <input
              type="checkbox"
              id="reduced-motion-toggle"
              checked={preferences.reducedMotion}
              onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
              className="w-5 h-5 rounded accent-brand text-brand focus:ring-brand cursor-pointer"
            />
          </div>

          {/* High Contrast Focus Outlines */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-title-sm text-title-sm font-semibold text-text-primary">High-Contrast Focus Rings</p>
              <p className="font-body-sm text-body-sm text-text-secondary">
                Enhances keyboard focus indicators with thick 3px brand borders and offsets
              </p>
            </div>
            <input
              type="checkbox"
              id="high-contrast-toggle"
              checked={preferences.highContrastFocus}
              onChange={(e) => updatePreferences({ highContrastFocus: e.target.checked })}
              className="w-5 h-5 rounded accent-brand text-brand focus:ring-brand cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Local-First Data Sovereignty & Backup */}
      <section className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Data Ownership & Backups</span>
          </h2>
          <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-success bg-success-bg px-2 py-0.5 rounded">
            100% Offline
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
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
          <label className="inline-flex items-center justify-center font-label-md text-label-md font-medium rounded-xl transition-colors focus-within:ring-2 focus-within:ring-brand px-3 py-1.5 gap-1.5 border border-border-subtle/40 bg-bg-surface text-text-primary hover:bg-bg-sunken shadow-sm cursor-pointer min-h-[36px]">
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
          className="font-body-sm text-body-sm text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        >
          Restore default preferences
        </button>
      </div>
    </div>
  );
};
