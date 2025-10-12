import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <div className="lg:pl-64">
        <Header user={session.user} />

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
