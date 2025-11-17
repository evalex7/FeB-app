'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Repeat,
  AreaChart,
  LogOut,
  Loader2,
  User as UserIcon,
  Settings,
  Menu,
  PlusCircle,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from './ui/skeleton';
import { useAuth, useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { doc } from 'firebase/firestore';
import type { FamilyMember, RecurringPayment, Transaction } from '@/lib/types';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import TransactionForm from './dashboard/TransactionForm';
import HeaderPaymentReminders from './dashboard/HeaderPaymentReminders';
import SettingsForm from './settings/SettingsForm';

const menuItems = [
  { href: '/dashboard', label: 'Панель', icon: LayoutDashboard },
  { href: '/budgets', label: 'Бюджети', icon: Target },
  { href: '/payments', label: 'Рахунки', icon: Receipt },
  { href: '/reports', label: 'Звіти', icon: AreaChart },
];

export default function AppLayout({
  children,
  pageTitle
}: {
  children: React.ReactNode;
  pageTitle: string;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [prefilledTransaction, setPrefilledTransaction] = useState<Partial<Transaction> | undefined>(undefined);
  const lastScrollY = useRef(0);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: familyMember } = useDoc<FamilyMember>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!isUserLoading && user && pathname === '/') {
      router.replace('/dashboard');
    }
  }, [pathname, user, isUserLoading, router]);
  
  useEffect(() => {
    const handleScroll = () => {
      // Only run this logic on mobile
      if (!isMobile) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsHeaderVisible(false);
      } else {
        // Scrolling up
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]); // Dependency on isMobile is correct here

  const handleLogout = () => {
    auth.signOut();
  };
  
  const getIsActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleOpenTransactionForm = (payment?: Partial<RecurringPayment & { remainingAmount: number }>) => {
    if (payment) {
        setPrefilledTransaction({
            amount: payment.remainingAmount,
            description: payment.description,
            category: payment.category,
            type: 'expense'
        });
    } else {
        setPrefilledTransaction(undefined);
    }
    setIsAddTransactionOpen(true);
  };
  
  const handleSettingsToggle = () => {
    if (pathname === '/settings' || pathname === '/profile') {
      router.push('/dashboard');
    } else {
      router.push('/settings');
    }
  };

  if (isMobile === null) {
      return (
        <div className="flex min-h-screen w-full">
            <div className="hidden md:flex flex-col w-[256px] border-r bg-sidebar">
                <div className="p-3 h-16 border-b flex items-center"><Skeleton className="h-8 w-3/4 bg-sidebar-accent" /></div>
                <div className="p-3 space-y-2">
                  <Skeleton className="h-10 w-full bg-sidebar-accent" />
                  <Skeleton className="h-10 w-full bg-sidebar-accent" />
                  <Skeleton className="h-10 w-full bg-sidebar-accent" />
                  <Skeleton className="h-10 w-full bg-sidebar-accent" />
                </div>
            </div>
            <div className="flex flex-col flex-1">
                 <div className="flex h-16 items-center border-b px-6 "><Skeleton className="h-8 w-1/4" /></div>
                 <main className="flex-1 p-4 md:p-6"><Skeleton className="w-full h-full" /></main>
                 <div className="md:hidden h-16 border-t"><Skeleton className="w-full h-full" /></div>
            </div>
        </div>
      )
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const UserAvatar = ({ className }: { className?: string }) => (
    <Avatar className={cn("h-8 w-8", className)}>
      {familyMember ? (
        <AvatarFallback style={{ backgroundColor: familyMember.color }} className="text-white font-bold">
          {getInitials(familyMember.name)}
        </AvatarFallback>
      ) : (
        <AvatarFallback>
          <UserIcon className="h-5 w-5" />
        </AvatarFallback>
      )}
    </Avatar>
  );

  const DesktopNav = () => (
     <nav className="hidden md:flex items-center gap-1 rounded-lg bg-muted p-1">
      {menuItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground",
            getIsActive(item.href) ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const MobileBottomNav = () => {
    return (
      <div className={cn(
          "md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t transition-transform duration-300",
          isHeaderVisible ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="grid h-full grid-cols-5 mx-auto font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-2 hover:bg-muted group",
                getIsActive(item.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
          <button
              onClick={handleSettingsToggle}
              className={cn(
                "inline-flex flex-col items-center justify-center px-2 hover:bg-muted group",
                pathname === '/settings' || pathname === '/profile' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-xs">Налаштув.</span>
            </button>
        </div>
      </div>
    );
  };

  const MobileNavMenu = () => (
     <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <Logo className="h-6 w-6" />
              <span>Сімейні фінанси</span>
            </Link>
            {menuItems.map(item => (
                 <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileSheetOpen(false)}
                    className={cn(
                        "flex items-center gap-4 rounded-xl px-3 py-2",
                        getIsActive(item.href) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
          </nav>
          <div className="mt-auto">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 h-12">
                   <UserAvatar />
                   <div className="text-left">
                       <p className="font-medium">{familyMember?.name || 'User'}</p>
                       <p className="text-xs text-muted-foreground">{familyMember?.email}</p>
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => { router.push('/profile'); setIsMobileSheetOpen(false); }}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Профіль</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => { router.push('/settings'); setIsMobileSheetOpen(false); }}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Налаштування</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Вийти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetContent>
      </Sheet>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className={cn(
          "sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-30 transition-transform duration-300",
          isMobile && !isHeaderVisible && "-translate-y-full"
        )}>
           <div className="flex items-center gap-2">
               <div className="md:hidden">
                <MobileNavMenu />
               </div>
               <div className="hidden md:flex">
                 <Button variant="ghost" size="icon" onClick={handleSettingsToggle}>
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Відкрити налаштування</span>
                </Button>
               </div>
              <Link href="/dashboard" className="hidden md:flex items-center gap-2 font-semibold">
                <Logo className="h-6 w-6" />
                <span className={cn("text-lg", isMobile && "hidden sm:inline")}>Сімейні фінанси</span>
              </Link>
           </div>
           
            <div className="flex flex-1 justify-center">
              <DesktopNav />
            </div>

            <div className="flex w-full flex-1 md:w-auto md:flex-initial justify-end items-center gap-2">
                
                <HeaderPaymentReminders onPayClick={handleOpenTransactionForm} />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hidden md:flex">
                      <UserAvatar />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-4" align="end">
                    <DropdownMenuLabel>
                      Профіль
                    </DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <SettingsForm />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings')} >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Більше налаштувань</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive/80 focus:text-destructive-foreground">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Вийти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 md:pb-8">
            {children}
        </main>
        {isMobile && <MobileBottomNav />}

        <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Додати транзакцію</DialogTitle>
                    <DialogDescription>
                    Запишіть новий дохід або витрату до вашого рахунку.
                    </DialogDescription>
                </DialogHeader>
                <TransactionForm
                    onSave={() => setIsAddTransactionOpen(false)}
                    initialValues={prefilledTransaction}
                />
            </DialogContent>
        </Dialog>
    </div>
  );
}
