import './globals.css';
import Sidebar from '@/components/Sidebar';
import Chatbot from '@/components/Chatbot';
import AppProviders from '@/components/AppProviders';

export const metadata = {
  title: 'End-to-End Technical Problem Setter',
  description: 'AI-powered technical assessment generation platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <AppProviders>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
            <Chatbot />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
