import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    redirect('/login');
  }

  // Check if user has admin role
  // @ts-ignore
  if (session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div>
      <AdminSidebar />

      <div className="lg:pl-72">
        <AdminHeader user={session.user} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const runtime = 'edge';
