'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CreditCard,
  FileText,
  Settings,
  Sparkles,
  ListChecks,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  {
    name: 'CMS',
    icon: FileText,
    children: [
      { name: 'Services', href: '/admin/cms/services', icon: Sparkles },
      { name: 'Features', href: '/admin/cms/features', icon: ListChecks },
      { name: 'Portfolio', href: '/admin/cms/portfolio', icon: Briefcase },
      { name: 'Process', href: '/admin/cms/process', icon: Settings },
      { name: 'FAQs', href: '/admin/cms/faqs', icon: HelpCircle },
    ],
  },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Lunaxcode</span>
            <span className="px-2 py-1 text-xs font-semibold bg-purple-600 text-white rounded">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    {!item.children ? (
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          pathname === item.href
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    ) : (
                      <div>
                        <div className="text-xs font-semibold leading-6 text-gray-400 mb-2 px-2">
                          {item.name}
                        </div>
                        <ul role="list" className="-mx-2 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                className={`group flex gap-x-3 rounded-md p-2 pl-8 text-sm leading-6 font-semibold transition-colors ${
                                  pathname === child.href
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                              >
                                <child.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
