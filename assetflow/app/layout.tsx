'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NewAssetModal from '../components/NewAssetModal';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="min-h-full flex flex-col bg-slate-50">
        {isLoginPage ? (
          children
        ) : (
          <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <Header />
            <div className="pl-64 pt-16 min-h-screen">
              <main className="p-8">
                {children}
              </main>
            </div>
            <NewAssetModal />
          </div>
        )}
      </body>
    </html>
  );
}
