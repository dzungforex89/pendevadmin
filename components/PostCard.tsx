import Link from 'next/link';
import { Post } from '../data/posts';

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="py-4 border-b">
      <h3 className="text-lg font-semibold"><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
      <p className="text-sm text-slate-600">{post.excerpt}</p>
    </article>
  );
}
