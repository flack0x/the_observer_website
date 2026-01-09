import { Metadata } from 'next';
import '../globals.css';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin | The Observer',
  description: 'Content Management System for The Observer',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-midnight-900 text-slate-light antialiased">
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  );
}
