import type { MetadataRoute } from 'next';
import { listBlogPosts } from '@/lib/blog';
import { FEATURES } from '@/components/marketing/features-data';
import { USE_CASES } from '@/components/marketing/use-cases-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const now = new Date();

  const staticRoutes = [
    { path: '', priority: 1 },
    { path: '/features', priority: 0.9 },
    { path: '/use-cases', priority: 0.8 },
    { path: '/pricing', priority: 0.9 },
    { path: '/about', priority: 0.6 },
    { path: '/contact', priority: 0.6 },
    { path: '/blog', priority: 0.7 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
    { path: '/signup', priority: 0.8 },
    { path: '/login', priority: 0.5 },
  ].map((r) => ({ url: `${base}${r.path}`, lastModified: now, priority: r.priority }));

  const featureRoutes = FEATURES.map((f) => ({
    url: `${base}/features/${f.slug}`,
    lastModified: now,
    priority: 0.7,
  }));
  const useCaseRoutes = USE_CASES.map((u) => ({
    url: `${base}/use-cases/${u.slug}`,
    lastModified: now,
    priority: 0.7,
  }));
  const blogRoutes = listBlogPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date + 'T00:00:00Z'),
    priority: 0.6,
  }));

  return [...staticRoutes, ...featureRoutes, ...useCaseRoutes, ...blogRoutes];
}
