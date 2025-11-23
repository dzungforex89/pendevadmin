import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b py-6 mb-6">
      <div className="container flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">Minimal Blog</Link>
        <nav className="space-x-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/admin" className="ml-3 text-sky-600">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
