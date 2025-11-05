'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export default function Header({ user }: { user: any }) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2">
          <img
            src="/android-chrome-192x192.png"
            alt="Lunaxcode Logo"
            className="w-8 h-8"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Lunaxcode
          </span>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-sm hidden sm:block">
                <p className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{user?.name}</p>
                <p className="text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
