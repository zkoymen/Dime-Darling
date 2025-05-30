import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { Toaster } from "@/components/ui/toaster"
import { SpendWiseProvider } from '@/context/spendwise-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dime Darling - Smart Budgeting',
  description: 'Your personal finance companion for smart budgeting and expense tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased font-sans`,
          'min-h-screen bg-background font-sans antialiased'
        )}
      >
        <SpendWiseProvider>
          <SidebarProvider defaultOpen>
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <AppHeader />
              <SidebarInset>
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </SpendWiseProvider>
      </body>
    </html>
  );
}
