import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Keep Geist font
import './globals.css';
import AppHeader from '@/components/AppHeader';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono is not used, removed for cleaner code
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'BlogiLite', // Update title
  description: 'A simple blog platform built with Next.js and FastAPI.', // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Use geistSans for the primary font */}
      <body className={`${geistSans.variable} font-sans antialiased bg-secondary`}>
        <AppHeader />
        <main className="container mx-auto py-8 px-4 min-h-[calc(100vh-theme(spacing.32))]">
          {children}
        </main>
         <Toaster /> {/* Add Toaster here */}
         <footer className="bg-primary/80 text-primary-foreground/80 text-center p-4 mt-8">
           © {new Date().getFullYear()} BlogiLite. All rights reserved.
         </footer>
      </body>
    </html>
  );
}
