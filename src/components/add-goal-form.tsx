"use client";


import { useTransition, useState, useEffect } from "react";
import { addGoal } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";

export function AddGoalForm() {
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [breakdownItems, setBreakdownItems] = useState<Array<{ itemName: string; amount: string }>>([]);

    // Calculate total from breakdown items
    const totalFromBreakdown = breakdownItems.reduce((sum, item) => {
        const amount = parseInt(item.amount || "0");
        return sum + amount;
    }, 0);

    // Auto-set targetAmount when breakdown changes
    useEffect(() => {
        if (breakdownItems.length > 0 && totalFromBreakdown > 0) {
            setTargetAmount(totalFromBreakdown.toString());
        }
    }, [breakdownItems, totalFromBreakdown]);

    const addBreakdownItem = () => {
        setBreakdownItems([...breakdownItems, { itemName: "", amount: "" }]);
    };

    const removeBreakdownItem = (index: number) => {
        setBreakdownItems(breakdownItems.filter((_, i) => i !== index));
    };

    const updateBreakdownItem = (index: number, field: "itemName" | "amount", value: string) => {
        const newItems = [...breakdownItems];
        newItems[index][field] = value;
        setBreakdownItems(newItems);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !targetAmount) return;

        const breakdownData = breakdownItems
            .filter(item => item.itemName && item.amount)
            .map(item => ({
                itemName: item.itemName,
                amount: parseInt(item.amount),
            }));

        startTransition(async () => {
            await addGoal({
                name,
                targetAmount: parseFloat(targetAmount),
                deadline: deadline ? new Date(deadline) : undefined,
                coverImage: coverImage || undefined,
                breakdownItems: breakdownData.length > 0 ? breakdownData : undefined,
            });
            // Reset form
            setName("");
            setTargetAmount("");
            setDeadline("");
            setCoverImage("");
            setBreakdownItems([]);
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tambah Impian Baru</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="goal-name">Nama Impian</Label>
                        <Input
                            id="goal-name"
                            placeholder="Contoh: Beli Rumah, Liburan ke Jepang"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cover-image">Cover Image URL (Optional)</Label>
                        <Input
                            id="cover-image"
                            type="url"
                            placeholder="https://..."
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Gambar untuk visualisasi impian Anda</p>
                    </div>

                    {/* Breakdown Items Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Rincian Dana (Optional)</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addBreakdownItem}
                            >
                                <PlusCircle className="h-4 w-4 mr-1" />
                                Tambah Item
                            </Button>
                        </div>

                        {breakdownItems.length > 0 && (
                            <div className="space-y-2 border rounded-lg p-3">
                                {breakdownItems.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Nama item (e.g., Tiket Pesawat)"
                                            value={item.itemName}
                                            onChange={(e) => updateBreakdownItem(index, "itemName", e.target.value)}
                                            className="flex-1"
                                        />
                                        <MoneyInput
                                            placeholder="0"
                                            value={item.amount}
                                            onValueChange={(value) => updateBreakdownItem(index, "amount", value)}
                                            className="w-40"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeBreakdownItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                ))}
                                {totalFromBreakdown > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium text-right">
                                            Total: Rp {new Intl.NumberFormat("id-ID").format(totalFromBreakdown)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="target">Target Dana (Rp)</Label>
                        <MoneyInput
                            id="target"
                            placeholder="0"
                            value={targetAmount}
                            onValueChange={setTargetAmount}
                            required
                            disabled={breakdownItems.length > 0}
                        />
                        {breakdownItems.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Target otomatis dihitung dari rincian dana
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline (Optional)</Label>
                        <Input
                            id="deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan Impian"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
