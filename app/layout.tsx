import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ORBIT Intelligence — Your next opportunity is out there',
    template: '%s · ORBIT Intelligence',
  },
  description:
    'ORBIT continuously scans marketplaces and the web, scores what matches your criteria, and alerts you before the market does.',
};

export const viewport: Viewport = {
  themeColor: '#F6F7F9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
