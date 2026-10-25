import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactView } from '@/components/marketing/contact-view';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Sales, support, partnerships and press — talk to the ORBIT team.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <Suspense>
      <ContactView />
    </Suspense>
  );
}
