import React from 'react';
import {
  Menu,
  GraduationCap,
  Calendar,
  Search,
  Bell,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewTask: () => void;
  onSelectTab: (tab: 'today' | 'tasks' | 'focus' | 'progress' | 'settings') => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewTask: _onOpenNewTask,
  onSelectTab,
  isMobileMenuOpen = false,
}) => {
  // Format current date nicely: "Thursday, 24 October"
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <header className="fixed top-0 left-0 lg:left-[248px] right-0 h-14 bg-bg-page/95 backdrop-blur-md z-40 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-border-subtle/30">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          id="mobile-menu-toggle-btn"
          className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-text-tertiary font-label-md text-label-md">
          <GraduationCap className="w-4 h-4 text-text-tertiary shrink-0" />
          <span>Studio</span>
          <span className="text-border-strong font-light mx-1">/</span>
          <span className="text-text-primary font-medium">ClearStep</span>
        </div>
      </div>

      {/* Right: Date, Search, Notifications */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 text-text-secondary font-label-md text-label-md">
          <Calendar className="w-4 h-4 text-text-tertiary shrink-0" />
          <span className="hidden sm:inline">{formattedDate}</span>
          <span className="sm:hidden">{today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="h-4 w-[1px] bg-border-subtle hidden sm:block"></div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('tasks')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-text-secondary hover:text-text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
            type="button"
            aria-label="Search tasks"
            title="Search tasks (/)"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectTab('today')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-text-secondary hover:text-text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
            type="button"
            aria-label="Notifications"
            title="Focus notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
