'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';

export function AppHeader() {
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find(item => pathname.startsWith(item.href))?.title || APP_NAME;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground hidden sm:block">{currentPage}</h1>
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/transactions/add">
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
          {/* <Button variant="outline" size="icon">
            <UserCircle className="h-5 w-5" />
            <span className="sr-only">User Profile</span>
          </Button> */}
        </div>
      </div>
    </header>
  );
}
