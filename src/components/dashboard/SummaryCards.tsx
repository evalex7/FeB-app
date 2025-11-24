'use client';

import { TrendingUp, TrendingDown, Scale, CreditCard, Landmark, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { FamilyMember } from '@/lib/types';


const formatCurrency = (amount: number) => {
    if (isNaN(amount)) {
      return '0,00 ₴';
    }
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(amount);
  };

type SummaryCardsProps = {
    selectedPeriod: string;
};

export default function SummaryCards({ selectedPeriod }: SummaryCardsProps) {
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: familyMember, isLoading: isMemberLoading } = useDoc<FamilyMember>(userDocRef);

  const [formattedIncome, setFormattedIncome] = useState('0,00 ₴');
  const [formattedExpenses, setFormattedExpenses] = useState('0,00 ₴');
  
  const [formattedCreditLimit, setFormattedCreditLimit] = useState('0,00 ₴');
  const [formattedCreditUsed, setFormattedCreditUsed] = useState('0,00 ₴');
  const [formattedOwnFunds, setFormattedOwnFunds] = useState('0,00 ₴');
  const [formattedTotalBalance, setFormattedTotalBalance] = useState('0,00 ₴');
  
  const [totalBalance, setTotalBalance] = useState(0);
  
  const isLoading = isTransactionsLoading || isMemberLoading;

  useEffect(() => {
    if (isLoading) return;

    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;
    
    if (selectedPeriod !== 'all') {
      const periodDate = parseISO(`${selectedPeriod}-01`);
      periodStart = startOfMonth(periodDate);
      periodEnd = endOfMonth(periodDate);
    }

    const { income, expenses } = transactions.reduce(
      (acc, transaction) => {
        const transactionDate = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);
        
        const inPeriod = !periodStart || !periodEnd || (transactionDate >= periodStart && transactionDate <= periodEnd);

        if (inPeriod) {
            switch(transaction.type) {
                case 'income':
                    acc.income += transaction.amount;
                    break;
                case 'expense':
                    acc.expenses += transaction.amount;
                    break;
            }
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
    
    const totalCreditLimit = familyMember?.creditLimit || 0;
    
    const balance = income - expenses;
    const ownFunds = Math.max(0, balance);
    const creditUsed = Math.min(totalCreditLimit, Math.max(0, expenses - income));
    const newTotalBalance = ownFunds + (totalCreditLimit - creditUsed);
    setTotalBalance(newTotalBalance);

    setFormattedIncome(formatCurrency(income));
    setFormattedExpenses(formatCurrency(expenses));
    setFormattedCreditLimit(formatCurrency(totalCreditLimit));
    setFormattedCreditUsed(formatCurrency(creditUsed));
    setFormattedOwnFunds(formatCurrency(ownFunds));
    setFormattedTotalBalance(formatCurrency(newTotalBalance));

  }, [transactions, familyMember, selectedPeriod, isLoading]);


  return (
    <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Дохід</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-teal-600">{formattedIncome}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Витрати</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-blue-600">{formattedExpenses}</div>
        </CardContent>
      </Card>
       <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Кредитний ліміт</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-orange-500">{formattedCreditLimit}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Використано кредиту</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn(
            "text-xl font-bold",
            'text-orange-500'
            )}
          >
            {formattedCreditUsed}
          </div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Власні кошти</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-green-600">
            {formattedOwnFunds}
          </div>
        </CardContent>
      </Card>
       <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Загальний баланс</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn(
            "text-xl font-bold",
            totalBalance >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {formattedTotalBalance}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
