'use client';

import { Menu, Bell, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface AdminHeaderProps {
  user: any;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-border dark:border-gray-700 bg-card dark:bg-card px-4 shadow-sm sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white lg:hidden">
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-muted/80 dark:bg-gray-700 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-2 sm:gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-base sm:text-lg font-semibold text-foreground dark:text-white truncate">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-gray-300"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-muted/80 dark:lg:bg-gray-700" aria-hidden="true" />

          <div className="flex items-center gap-x-2 sm:gap-x-4">
            <span className="text-sm font-medium text-muted-foreground dark:text-gray-300 hidden md:inline truncate max-w-[120px] lg:max-w-[200px]">{user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-x-2 text-sm font-medium text-muted-foreground dark:text-gray-300 hover:text-foreground dark:hover:text-white"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
