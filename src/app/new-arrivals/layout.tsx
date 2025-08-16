import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'New Arrivals',
  description: 'Shop the latest products added to our store',
  openGraph: {
    title: 'New Arrivals',
    description: 'Shop the latest products added to our store',
    type: 'website',
    url: `${siteConfig.url}/new-arrivals`,
  },
};

export default function NewArrivalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
