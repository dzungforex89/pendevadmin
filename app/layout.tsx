import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export const metadata = {
  title: '10SAT Console',
  description: 'Giao diện quản lý 10SAT'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'oklch(0.98 0.01 260)' }}>
        <div className="min-h-screen flex">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-[280px]">
            <main className="flex-1 px-4 py-8 lg:px-8">
              <div className="max-w-6xl mx-auto w-full">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
