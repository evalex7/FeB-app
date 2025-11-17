'use client';

import AppLayout from '@/components/AppLayout';
import CategoriesSettings from '@/components/settings/CategoriesSettings';
import ThemeSettings from '@/components/settings/ThemeSettings';
import ChartSettings from '@/components/settings/ChartSettings';
import CreditSettings from '@/components/settings/CreditSettings';

export default function SettingsPage() {
  return (
    <AppLayout pageTitle="Налаштування">
      <div className="space-y-6">
        <CreditSettings />
        <CategoriesSettings />
        <ThemeSettings />
        <ChartSettings />
      </div>
    </AppLayout>
  );
}
