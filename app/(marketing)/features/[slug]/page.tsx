import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FEATURES } from '@/components/marketing/features-data';
import { FeaturePage } from '@/components/marketing/feature-page';

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const feature = FEATURES.find((f) => f.slug === slug);
  if (!feature) return {};
  return {
    title: feature.title,
    description: feature.sub,
    alternates: { canonical: `/features/${slug}` },
  };
}

export default async function FeatureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = FEATURES.find((f) => f.slug === slug);
  if (!feature) notFound();
  const related = FEATURES.filter((f) => f.slug !== slug)
    .slice(0, 2)
    .map((f) => ({ label: f.title, href: `/features/${f.slug}` }));
  return <FeaturePage data={feature} related={related} />;
}
