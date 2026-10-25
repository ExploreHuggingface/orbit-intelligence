/* Blog post loading: MDX files in content/blog with gray-matter frontmatter. */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingMinutes: number;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export function listBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      const words = content.split(/\s+/).filter(Boolean).length;
      return {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ''),
        category: String(data.category ?? 'Product'),
        date: String(data.date ?? '2026-10-25'),
        readingMinutes: Math.max(1, Math.round(words / 210)),
        content,
      } satisfies BlogPost;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBlogPost(slug: string): BlogPost | null {
  return listBlogPosts().find((p) => p.slug === slug) ?? null;
}
