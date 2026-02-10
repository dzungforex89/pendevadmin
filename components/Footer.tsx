"use client";

export default function Footer() {
  return (
    <footer 
      className="border-t py-6 mt-auto"
      style={{ 
        borderColor: 'rgba(17,24,39,0.08)',
        backgroundColor: 'white'
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <p 
          className="text-sm text-center"
          style={{ color: 'var(--foreground)' }}
        >
          © {new Date().getFullYear()} PenDev Console. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
