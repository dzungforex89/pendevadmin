"use client";

export default function Footer() {
  return (
    <footer 
      className="border-t py-6 mt-auto"
      style={{ 
        borderColor: 'oklch(0.3036 0.1223 288 / 0.2)',
        backgroundColor: 'oklch(0.98 0.01 260)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <p 
          className="text-sm text-center"
          style={{ color: 'oklch(0.5 0.04 260)' }}
        >
          © {new Date().getFullYear()} 10SAT Console. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
