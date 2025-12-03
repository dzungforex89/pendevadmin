import Link from 'next/link';

export default function Header() {
  return (
    <header 
      className="border-b py-4 mb-6 shadow-sm" 
      style={{ 
        borderColor: 'oklch(0.3036 0.1223 288)',
        backgroundColor: 'oklch(0.98 0.01 260)'
      }}
    >
      <div className="w-full flex items-center justify-between" style={{ paddingLeft: '22.5rem', paddingRight: '22.55rem' }}>
        <Link 
          href="/" 
          className="text-2xl font-semibold header-logo"
          style={{ color: 'oklch(0.5638 0.2255 24.24)' }}
        >
          10SAT Console
        </Link>
        <nav className="flex items-center gap-4 text-base">
          <Link 
            href="/" 
            className="header-nav-link font-medium px-4 py-2 rounded"
          >
            Trang chủ
          </Link>
          <Link 
            href="/admin" 
            className="header-admin-link font-medium px-4 py-2 rounded"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
