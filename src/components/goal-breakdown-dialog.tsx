"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getGoalBreakdown } from "@/app/actions";
import { ListFilter } from "lucide-react";

interface GoalBreakdownDialogProps {
    goalId: number;
    goalName: string;
}

export function GoalBreakdownDialog({ goalId, goalName }: GoalBreakdownDialogProps) {
    const [open, setOpen] = useState(false);
    const [breakdownItems, setBreakdownItems] = useState<Array<{ id: number; itemName: string; amount: number }>>([]);
    const [isLoading, setIsLoading] = useState(false);

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            getGoalBreakdown(goalId)
                .then(items => {
                    setBreakdownItems(items);
                })
                .finally(() => setIsLoading(false));
        }
    }, [open, goalId]);

    const totalAmount = breakdownItems.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <ListFilter className="h-4 w-4 mr-1" />
                    Lihat Rincian
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rincian Dana: {goalName}</DialogTitle>
                    <DialogDescription>
                        Daftar item untuk mencapai impian ini
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-4">Memuat...</p>
                    ) : breakdownItems.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">Tidak ada rincian dana</p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 font-medium text-sm border-b pb-2">
                                    <span>Item</span>
                                    <span className="text-right">Jumlah</span>
                                </div>
                                {breakdownItems.map((item) => (
                                    <div key={item.id} className="grid grid-cols-2 text-sm py-1">
                                        <span>{item.itemName}</span>
                                        <span className="text-right">{formatIDR(item.amount)}</span>
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 font-bold border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span className="text-right">{formatIDR(totalAmount)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
