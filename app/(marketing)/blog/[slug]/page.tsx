import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getBlogPost, listBlogPosts } from '@/lib/blog';

export function generateStaticParams() {
  return listBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title: post.title, description: post.description, type: 'article' },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const others = listBlogPosts().filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-[760px] px-6 py-16 md:py-20">
      <Link href="/blog" className="focus-ring rounded text-[13px] text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink)]">
        ← All posts
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="rounded-full bg-[color:var(--color-brand-subtle)] px-2.5 py-1 font-semibold text-[color:var(--color-brand)]">
          {post.category}
        </span>
        <span className="text-[var(--color-ink-tertiary)]">
          {new Date(post.date + 'T00:00:00Z').toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <span className="text-[var(--color-ink-tertiary)]">· {post.readingMinutes} min read</span>
      </div>
      <h1 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)] md:text-[40px]">
        {post.title}
      </h1>
      <p className="prose-measure mt-4 text-[17px] leading-relaxed text-[var(--color-ink-secondary)]">{post.description}</p>

      <div className="prose-orbit mt-10">
        <MDXRemote source={post.content} />
      </div>

      {others.length > 0 && (
        <div className="mt-16 border-t border-[var(--color-line)] pt-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-ink-tertiary)]">
            Keep reading
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/blog/${o.slug}`}
                className="focus-ring rounded-xl border border-[var(--color-line)] bg-white p-5 hover:shadow-[var(--shadow-sm)]"
              >
                <p className="text-[15px] font-semibold text-[var(--color-ink)]">{o.title}</p>
                <p className="mt-1 text-[13px] text-[var(--color-ink-secondary)]">{o.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
