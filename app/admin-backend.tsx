import { headers } from 'next/headers';
import AdminFrontend, { Post } from './admin-frontend';

async function fetchPosts(): Promise<Post[]> {
  const headerList = headers();
  const protocol = headerList.get('x-forwarded-proto') ?? 'http';
  const host = headerList.get('host');
  const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const baseUrl = host ? `${protocol}://${host}` : fallbackBase;

  try {
    const res = await fetch(`${baseUrl}/api/posts`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch {
    return [];
  }
}

export default async function AdminBackend() {
  const initialPosts = await fetchPosts();
  return <AdminFrontend initialPosts={initialPosts} />;
}

