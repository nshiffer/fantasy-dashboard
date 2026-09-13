import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://fantasyfootball.shwrk.com'),
  title: 'Fantasy Dashboard for Sleeper Leagues',
  description: 'Analyze Sleeper fantasy football standings, matchups, scoring, rosters, and draft needs in one dashboard.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Fantasy Dashboard',
    title: 'Fantasy Dashboard for Sleeper Leagues',
    description: 'Analyze Sleeper fantasy football standings, matchups, scoring, rosters, and draft needs in one dashboard.',
  },
  twitter: {
    card: 'summary',
    title: 'Fantasy Dashboard for Sleeper Leagues',
    description: 'Analyze Sleeper fantasy football standings, matchups, scoring, rosters, and draft needs in one dashboard.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-dark-900 text-dark-900 dark:text-white`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
