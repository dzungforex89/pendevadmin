import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Minimal Blog',
  description: 'A minimalist personal blog'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
