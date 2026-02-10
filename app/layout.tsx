import '../styles/globals.css';
import { SidebarProvider } from '../contexts/SidebarContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import MainContent from '../components/MainContent';

export const metadata = {
  title: 'PenDev Console',
  description: 'Giao diện quản lý PenDev'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'white' }}>
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
