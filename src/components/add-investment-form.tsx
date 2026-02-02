"use client";

import { useTransition, useState } from "react";
import { addInvestment } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddInvestmentForm() {
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("Saham");

    const investmentTypes = ["Saham", "Reksadana", "Emas", "Kripto", "Deposito", "Obligasi", "Lainnya"];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !amount) return;

        startTransition(async () => {
            await addInvestment({
                name,
                amount: parseFloat(amount),
                type,
            });
            // Reset form
            setName("");
            setAmount("");
            setType("Saham");
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tambah Investasi Baru</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Investasi</Label>
                        <Input
                            id="name"
                            placeholder="Contoh: BBCA, Reksadana XYZ"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Jenis Investasi</Label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {investmentTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Nilai Awal (Rp)</Label>
                        <MoneyInput
                            id="amount"
                            placeholder="0"
                            value={amount}
                            onValueChange={setAmount}
                            required
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Catatan:</strong> Dana investasi akan mengurangi saldo bank Anda dan otomatis tercatat sebagai transaksi pengeluaran.
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan Investasi"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
