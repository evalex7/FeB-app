'use client';

import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { PaymentsProvider } from '@/contexts/payments-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { BudgetsProvider } from '@/contexts/budgets-context';
import { CategoriesProvider } from '@/contexts/categories-context';
import { AppThemeProvider } from '@/components/AppThemeProvider';
import { SettingsProvider } from '@/contexts/settings-context';
import ThemeSync from '@/components/ThemeSync';
import { useEffect } from 'react';

export const metadata = {
  title: 'FeB App',
  description: 'Фінансовий менеджер',
  manifest: '/manifest.json',
  themeColor: '#0a0a0a',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker зареєстрований'))
        .catch(console.error);
    }
  }, []);

  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        {/* Шрифти */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          'font-body'
        )}
        suppressHydrationWarning
      >
        <AppThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeSync />

          <FirebaseClientProvider>
            <SettingsProvider>
              <CategoriesProvider>
                <PaymentsProvider>
                  <TransactionsProvider>
                    <BudgetsProvider>{children}</BudgetsProvider>
                  </TransactionsProvider>
                </PaymentsProvider>
              </CategoriesProvider>
            </SettingsProvider>
          </FirebaseClientProvider>

          <Toaster />
        </AppThemeProvider>
      </body>
    </html>
  );
}
