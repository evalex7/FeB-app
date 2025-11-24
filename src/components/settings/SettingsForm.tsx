'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { FamilyMember } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const profileColors = [
    'hsl(221, 83%, 53%)', // Blue
    'hsl(210, 90%, 50%)', // Sky
    'hsl(173, 58%, 39%)', // Turquoise
    'hsl(142, 71%, 45%)', // Green
    'hsl(48, 96%, 53%)',  // Yellow
    'hsl(43, 74%, 66%)',  // Mustard
    'hsl(27, 87%, 67%)',  // Orange
    'hsl(12, 76%, 61%)',  // Red
    'hsl(340, 82%, 52%)', // Crimson
    'hsl(314, 79%, 56%)', // Pink
    'hsl(280, 85%, 65%)', // Magenta
    'hsl(262, 84%, 59%)', // Purple
    'hsl(230, 75%, 60%)', // Indigo
    'hsl(190, 70%, 50%)', // Teal
];

export default function SettingsForm() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: familyMember, isLoading: isMemberLoading } = useDoc<FamilyMember>(userDocRef);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [color, setColor] = useState('');
    const [creditLimit, setCreditLimit] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (familyMember) {
            setName(familyMember.name);
            setEmail(familyMember.email);
            setColor(familyMember.color);
            setCreditLimit(String(familyMember.creditLimit || ''));
        }
    }, [familyMember]);

    const handleSave = (field: 'name' | 'color' | 'creditLimit', value: string | number) => {
        if (!user || !firestore) return;

        setIsSaving(true);
        const updatedData = { [field]: value };
        
        const userRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userRef, updatedData, { merge: true })
            .then(() => {
                toast({
                    title: 'Успіх!',
                    description: 'Ваші дані було оновлено.',
                });
            })
            .catch(error => {
                console.error("Error updating profile: ", error);
                 errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: userRef.path,
                        operation: 'update',
                        requestResourceData: updatedData
                    })
                );
                toast({
                    variant: 'destructive',
                    title: 'Помилка',
                    description: 'Сталася помилка під час збереження. Спробуйте ще раз.',
                });
            })
            .finally(() => {
                setIsSaving(false);
            });
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave('name', name);
        handleSave('creditLimit', parseFloat(creditLimit) || 0);
    };

    const handleColorSelect = (newColor: string) => {
        setColor(newColor);
        handleSave('color', newColor);
    }
    
    if (isMemberLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6 max-w-lg">
            <div className="grid gap-2">
                <Label htmlFor="name">Повне ім'я</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Електронна пошта</Label>
                <Input id="email" type="email" value={email} disabled />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="creditLimit">Кредитний ліміт</Label>
                <Input 
                    id="creditLimit" 
                    type="number"
                    placeholder="0.00"
                    value={creditLimit} 
                    onChange={(e) => setCreditLimit(e.target.value)} 
                />
            </div>
             <div className="grid gap-2">
                <Label>Колір аватара</Label>
                <div className="flex flex-wrap gap-2">
                    {profileColors.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className={cn(
                                "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                                color === c ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent'
                            )}
                            style={{ backgroundColor: c }}
                            onClick={() => handleColorSelect(c)}
                        />
                    ))}
                </div>
             </div>
             <Button type="submit" disabled={isSaving} size="sm" className="w-full">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Зберегти
            </Button>
        </form>
    );
}
