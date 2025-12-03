export default function Footer() {
  return (
    <footer className="border-t py-6 mt-12" style={{ borderColor: 'oklch(0.3036 0.1223 288)' }}>
      <div className="container text-center text-sm" style={{ color: 'oklch(0.22 0.04 260)' }}>
        © {new Date().getFullYear()} Minimal Blog
      </div>
    </footer>
  );
}
