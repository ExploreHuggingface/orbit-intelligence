import type { Metadata } from 'next';
import { PricingView } from '@/components/marketing/pricing-view';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free, Pro €99/mo and Scale €249/mo. Start free with 3 monitors — upgrade when the monitors earn it.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <PricingView />;
}
