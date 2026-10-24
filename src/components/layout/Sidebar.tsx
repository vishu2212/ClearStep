import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  CheckSquare,
  Timer,
  BarChart3,
  Settings,
  CheckCircle2,
  Database,
  X,
} from 'lucide-react';

export type NavTab = 'today' | 'tasks' | 'focus' | 'progress' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });

  const sidebarRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const updateMatch = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    updateMatch(mediaQuery);
    const listener = (e: MediaQueryListEvent) => updateMatch(e);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    if (isOpenMobile) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;

      // Focus close button or first interactive element inside drawer
      const timer = setTimeout(() => {
        if (sidebarRef.current) {
          const closeBtn = sidebarRef.current.querySelector<HTMLElement>('button[aria-label="Close sidebar"]');
          if (closeBtn) {
            closeBtn.focus();
          } else {
            const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length > 0) {
              focusable[0].focus();
            }
          }
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCloseMobile?.();
        }

        // Focus trap inside drawer
        if (e.key === 'Tab' && sidebarRef.current) {
          const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const firstElement = focusable[0];
          const lastElement = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isMobile, isOpenMobile, onCloseMobile]);

  const navItems: { id: NavTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: (active) => (
        <Sun className={`w-5 h-5 mr-3 shrink-0 ${active ? 'text-accent' : 'text-slate-300 group-hover:text-white'}`} />
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: (active) => (
        <CheckSquare className={`w-5 h-5 mr-3 shrink-0 ${active ? 'text-accent' : 'text-slate-300 group-hover:text-white'}`} />
      ),
    },
    {
      id: 'focus',
      label: 'Focus Mode',
      icon: (active) => (
        <Timer className={`w-5 h-5 mr-3 shrink-0 ${active ? 'text-accent' : 'text-slate-300 group-hover:text-white'}`} />
      ),
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: (active) => (
        <BarChart3 className={`w-5 h-5 mr-3 shrink-0 ${active ? 'text-accent' : 'text-slate-300 group-hover:text-white'}`} />
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (active) => (
        <Settings className={`w-5 h-5 mr-3 shrink-0 ${active ? 'text-accent' : 'text-slate-300 group-hover:text-white'}`} />
      ),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Left Fixed Sidebar (248px) */}
      <aside
        ref={sidebarRef}
        id="mobile-navigation-drawer"
        role={isMobile && isOpenMobile ? 'dialog' : undefined}
        aria-modal={isMobile && isOpenMobile ? 'true' : undefined}
        aria-label={isMobile ? 'Navigation drawer' : undefined}
        aria-hidden={isMobile && !isOpenMobile ? 'true' : undefined}
        inert={isMobile && !isOpenMobile ? true : undefined}
        className={`fixed left-0 top-0 h-full w-[248px] bg-accent-on z-50 flex flex-col justify-between py-4 select-none transition-transform duration-200 ease-in-out border-r border-brand-strong/40 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col w-full">
          {/* Logo Brand Lockup */}
          <div className="h-[56px] px-4 flex items-center justify-between">
            <button
              onClick={() => {
                onSelectTab('today');
                onCloseMobile?.();
              }}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1 cursor-pointer"
              aria-label="ClearStep Home"
            >
              <div className="w-7 h-7 rounded-xl bg-brand flex items-center justify-center shrink-0 shadow-sm text-accent">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-headline-sm text-headline-sm text-white tracking-tight font-semibold">ClearStep</span>
                <span className="font-label-sm text-label-sm text-slate-300/80 font-medium mt-[3px]">Student Studio</span>
              </div>
            </button>
            {/* Close button on mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            className="flex flex-col gap-1 px-2 mt-4"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile?.();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative flex items-center h-[44px] px-4 rounded-[10px] transition-colors w-full text-left font-body-md text-body-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'bg-brand/50 text-white font-semibold'
                      : 'text-slate-300/80 hover:text-white hover:bg-brand/20 font-medium'
                  }`}
                >
                  {/* Left Amber Indicator Rail for Active item */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-accent rounded-r-sm" />
                  )}
                  {item.icon(isActive)}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Local-first Studio Device Indicator */}
        <div className="px-4">
          <button
            onClick={() => {
              onSelectTab('settings');
              onCloseMobile?.();
            }}
            className="flex items-center gap-2.5 p-2 rounded-xl text-slate-300/80 hover:text-white hover:bg-brand/20 transition-colors group w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Data is saved in local browser storage"
          >
            <Database className="w-4 h-4 text-slate-300/70 group-hover:text-white shrink-0" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-medium text-white/90">Stored on this device</span>
              <span className="font-label-sm text-label-sm text-slate-400 leading-none mt-0.5">Local-first studio</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
