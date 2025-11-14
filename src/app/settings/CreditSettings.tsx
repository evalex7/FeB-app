'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreditAccount } from '@/contexts/credit-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CreditSettings() {
  const { creditAccount, updateCreditAccount, resetUsedCredit, isLoading } = useCreditAccount();

  const [limit, setLimit] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (creditAccount) {
      setLimit(String(creditAccount.creditLimit));
    }
  }, [creditAccount]);

  const handleSave = () => {
    const newLimit = parseFloat(limit);
    if (isNaN(newLimit) || newLimit < 0) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, введіть коректну суму кредитного ліміту.',
      });
      return;
    }

    updateCreditAccount(newLimit);
    toast({
      title: 'Успіх!',
      description: 'Ваш кредитний ліміт було оновлено.',
    });
  };

  const handleResetUsed = () => {
    resetUsedCredit();
    toast({
      title: 'Оновлено',
      description: 'Використаний кредит обнулено.',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Кредитний рахунок</CardTitle>
          <CardDescription>Керуйте вашим кредитним лімітом.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Кредитний рахунок</CardTitle>
        <CardDescription>Керуйте вашим кредитним лімітом.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Кредитний ліміт */}
        <div className="grid gap-2 max-w-sm">
          <Label htmlFor="credit-limit">Кредитний ліміт</Label>
          <Input
            id="credit-limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={limit === String(creditAccount?.creditLimit)}>
          Зберегти ліміт
        </Button>

        {/* Інформація про використаний кредит */}
        {creditAccount && (
          <div className="space-y-2 max-w-sm pt-4 border-t">
            <div className="text-sm">
              <p><strong>Використано кредиту:</strong> {creditAccount.usedCredit ?? 0} грн</p>
              <p><strong>Доступно:</strong> {creditAccount.availableCredit ?? 0} грн</p>
            </div>

            <Button variant="secondary" onClick={handleResetUsed}>
              Скинути використане
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
