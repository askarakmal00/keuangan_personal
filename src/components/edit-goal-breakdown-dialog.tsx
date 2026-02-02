"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getGoalBreakdown, addGoalBreakdownItem, deleteGoalBreakdownItem, updateGoalTarget } from "@/app/actions";
import { Edit, Trash2, PlusCircle } from "lucide-react";

interface EditGoalBreakdownDialogProps {
    goalId: number;
    goalName: string;
    currentTarget: number;
}

export function EditGoalBreakdownDialog({ goalId, goalName, currentTarget }: EditGoalBreakdownDialogProps) {
    const [open, setOpen] = useState(false);
    const [breakdownItems, setBreakdownItems] = useState<Array<{ id: number; itemName: string; amount: number }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    // New item form
    const [newItemName, setNewItemName] = useState("");
    const [newItemAmount, setNewItemAmount] = useState("");

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const loadBreakdown = async () => {
        setIsLoading(true);
        try {
            const items = await getGoalBreakdown(goalId);
            setBreakdownItems(items);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadBreakdown();
        }
    }, [open, goalId]);

    const totalAmount = breakdownItems.reduce((sum, item) => sum + item.amount, 0);

    const handleAddItem = () => {
        if (!newItemName || !newItemAmount) return;

        startTransition(async () => {
            await addGoalBreakdownItem({
                goalId,
                itemName: newItemName,
                amount: parseInt(newItemAmount),
            });

            // Reload breakdown
            await loadBreakdown();

            // Reset form
            setNewItemName("");
            setNewItemAmount("");
        });
    };

    const handleDeleteItem = (itemId: number) => {
        startTransition(async () => {
            await deleteGoalBreakdownItem(itemId);
            await loadBreakdown();
        });
    };

    const handleUpdateTarget = () => {
        if (totalAmount === 0) return;

        startTransition(async () => {
            await updateGoalTarget(goalId, totalAmount);
            setOpen(false);
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Rincian
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Rincian Dana: {goalName}</DialogTitle>
                    <DialogDescription>
                        Tambah atau hapus item untuk memperbarui rincian dana
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Existing Items */}
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-4">Memuat...</p>
                    ) : (
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Item Saat Ini:</h4>
                            {breakdownItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada rincian dana</p>
                            ) : (
                                <div className="space-y-2">
                                    {breakdownItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{item.itemName}</p>
                                                <p className="text-sm text-muted-foreground">{formatIDR(item.amount)}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteItem(item.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between font-bold">
                                            <span>Total dari rincian:</span>
                                            <span>{formatIDR(totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                            <span>Target saat ini:</span>
                                            <span>{formatIDR(currentTarget)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add New Item */}
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Tambah Item Baru:
                        </h4>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nama item (e.g., Tiket Pesawat)"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="flex-1"
                            />
                            <MoneyInput
                                placeholder="0"
                                value={newItemAmount}
                                onValueChange={setNewItemAmount}
                                className="w-40"
                            />
                            <Button
                                onClick={handleAddItem}
                                disabled={!newItemName || !newItemAmount || isPending}
                            >
                                Tambah
                            </Button>
                        </div>
                    </div>

                    {/* Update Target Button */}
                    {totalAmount > 0 && totalAmount !== currentTarget && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800 mb-2">
                                Total rincian ({formatIDR(totalAmount)}) berbeda dengan target saat ini ({formatIDR(currentTarget)}).
                            </p>
                            <Button
                                onClick={handleUpdateTarget}
                                disabled={isPending}
                                className="w-full"
                            >
                                Update Target ke {formatIDR(totalAmount)}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
