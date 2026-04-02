import './globals.css';
import Link from 'next/link';
import GradientThemeController from '@/components/GradientThemeController';

export const metadata = {
  title: 'CSV Chatbot',
  description: 'Simple AI-driven chatbot using CSV training data'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GradientThemeController />
        <header className="topbar">
          <h1>CSV Chatbot Platform</h1>
          <nav>
            <Link href="/">Chat</Link>
            <Link href="/history">History</Link>
            <Link href="/datasets">Datasets</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
