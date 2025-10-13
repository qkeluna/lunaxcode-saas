import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Check if user has admin role from database (not from cached JWT)
  try {
    const context = getRequestContext();

    if (!context?.env?.DB) {
      console.error('[Admin Layout] Database not available');
      redirect('/dashboard');
    }

    const db = drizzle(context.env.DB);

    // Fetch user role from database
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    console.log('[Admin Layout] User role check:', { email: session.user.email, role: user?.role });

    if (!user || user.role !== 'admin') {
      console.log('[Admin Layout] User is not admin, redirecting to /dashboard');
      redirect('/dashboard');
    }

    console.log('[Admin Layout] User is admin, allowing access');
  } catch (error) {
    console.error('[Admin Layout] Error checking admin role:', error);
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
