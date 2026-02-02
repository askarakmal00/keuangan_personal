
"use client";


import { useTransition, useState } from "react";
import { addDebt } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AddDebtForm() {
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<"PAYABLE" | "RECEIVABLE">("PAYABLE");

    const [amount, setAmount] = useState("");
    const [name, setName] = useState("");
    const [dueDate, setDueDate] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!amount || !name) return;

        startTransition(async () => {
            await addDebt({
                amount: parseFloat(amount),
                type,
                name,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            });
            setAmount("");
            setName("");
            setDueDate("");
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Catat Hutang / Piutang</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div
                            className={cn(
                                "flex-1 cursor-pointer border rounded-md p-4 flex items-center justify-center transition-colors font-medium",
                                type === "PAYABLE" ? "bg-red-100 border-red-500 text-red-700" : "hover:bg-accent"
                            )}
                            onClick={() => setType("PAYABLE")}
                        >
                            Hutang Saya (Payable)
                        </div>
                        <div
                            className={cn(
                                "flex-1 cursor-pointer border rounded-md p-4 flex items-center justify-center transition-colors font-medium",
                                type === "RECEIVABLE" ? "bg-green-100 border-green-500 text-green-700" : "hover:bg-accent"
                            )}
                            onClick={() => setType("RECEIVABLE")}
                        >
                            Orang Hutang (Receivable)
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">{type === "PAYABLE" ? "Berhutang Kepada" : "Peminjam"}</Label>
                        <Input
                            id="name"
                            placeholder="Nama Orang / Institusi"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Jumlah (Rp)</Label>
                        <MoneyInput
                            id="amount"
                            placeholder="0"
                            value={amount}
                            onValueChange={setAmount}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Jatuh Tempo (Optional)</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan Catatan"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
