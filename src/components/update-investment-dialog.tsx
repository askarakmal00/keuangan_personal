"use client";

import { useState, useTransition } from "react";
import { updateInvestmentValue } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";

interface UpdateInvestmentDialogProps {
    investmentId: number;
    currentValue: number;
    investmentName: string;
}

export function UpdateInvestmentDialog({ investmentId, currentValue, investmentName }: UpdateInvestmentDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [newValue, setNewValue] = useState(currentValue.toString());
    const [open, setOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newValue) return;

        startTransition(async () => {
            await updateInvestmentValue(investmentId, parseFloat(newValue));
            setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Update Nilai
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Nilai Investasi</DialogTitle>
                    <DialogDescription>
                        Perbarui nilai terkini dari {investmentName}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-value">Nilai Saat Ini (Rp)</Label>
                            <Input
                                id="new-value"
                                type="number"
                                placeholder="0"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
