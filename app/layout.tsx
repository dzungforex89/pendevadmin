import '../styles/globals.css';
import { SidebarProvider } from '../contexts/SidebarContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import MainContent from '../components/MainContent';

export const metadata = {
  title: '10SAT Console',
  description: 'Giao diện quản lý 10SAT'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'oklch(0.98 0.01 260)' }}>
        <SidebarProvider>
          <div className="min-h-screen flex">
            <Sidebar />
            <MainContent>
              {children}
            </MainContent>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
