import type { Metadata } from 'next';
import Link from 'next/link';
import { listBlogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Product updates, research notes and operator guides from the ORBIT team.',
  alternates: { canonical: '/blog' },
};

export default async function BlogIndexPage() {
  const posts = listBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
          From the ORBIT desk
        </h1>
        <p className="prose-measure mx-auto mt-4 text-[16px] leading-relaxed text-[var(--color-ink-secondary)] md:text-[17px]">
          Product updates, research notes and operator guides.
        </p>
      </div>

      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="focus-ring mt-14 block rounded-2xl border border-[var(--color-line)] bg-white p-8 transition-shadow hover:shadow-[var(--shadow-lg)] md:p-10"
        >
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="rounded-full bg-[color:var(--color-brand-subtle)] px-2.5 py-1 font-semibold text-[color:var(--color-brand)]">
              {featured.category}
            </span>
            <span className="text-[var(--color-ink-tertiary)]">
              {new Date(featured.date + 'T00:00:00Z').toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-[var(--color-ink-tertiary)]">· {featured.readingMinutes} min read</span>
          </div>
          <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-3xl">
            {featured.title}
          </h2>
          <p className="prose-measure mt-3 text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
            {featured.description}
          </p>
          <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-[color:var(--color-brand)]">
            Read the post →
          </span>
        </Link>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="focus-ring flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-7 transition-shadow hover:shadow-[var(--shadow-lg)]"
          >
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <span className="rounded-full border border-[var(--color-line)] px-2.5 py-0.5 font-medium text-[var(--color-ink-secondary)]">
                {post.category}
              </span>
              <span className="text-[var(--color-ink-tertiary)]">
                {new Date(post.date + 'T00:00:00Z').toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="text-[var(--color-ink-tertiary)]">· {post.readingMinutes} min read</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.01em] text-[var(--color-ink)]">{post.title}</h2>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{post.description}</p>
            <span className="mt-4 text-[14px] font-medium text-[color:var(--color-brand)]">Read →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
