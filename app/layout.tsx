import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { MainNav } from '@/components/navigation/main-nav';
import { Footer } from '@/components/navigation/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ContribMint',
  description: 'Role-based insights for open-source projects',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}> 
        <Providers>
          <div className="min-h-screen flex flex-col">
            <MainNav />
            <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl mx-auto w-full">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
