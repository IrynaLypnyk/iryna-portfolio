import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { routes } from '@/constants/routes';

export const dynamic = 'force-dynamic';

type Props = {
  children: React.ReactNode;
};

/**
 * Shared layout for all authenticated admin sections. Centralizes the
 * `requireAuth` redirect (previously duplicated in every admin page) and
 * renders the persistent admin navigation.
 */
export default async function ProtectedAdminLayout({ children }: Props) {
  try {
    await requireAuth();
  } catch {
    redirect(routes.admin.login);
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
