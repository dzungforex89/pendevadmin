import Link from 'next/link';
import { DEFAULT_THUMBNAIL_BASE64 } from '../constants/defaultThumbnail';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail?: string | null;
  date: string;
};

export default function PostCard({ post }: { post: Post }) {
  const thumbnailSrc = post.thumbnail || DEFAULT_THUMBNAIL_BASE64;
  
  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <article className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="w-full h-48 bg-gray-200 overflow-hidden">
          <img 
            src={thumbnailSrc} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 flex-1">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-3">{post.excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
