import { SITE_URL } from '@/lib/seo/config';
import { ExternalLink } from 'lucide-react';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';

export function OpenSiteButton() {
  return (
    <AdminButton
      variant="ghost"
      href={SITE_URL}
      external
      endIcon={<ExternalLink size={16} strokeWidth={1.5} />}
    >
      Visit site
    </AdminButton>
  );
}
