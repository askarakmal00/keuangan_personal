"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Trash2 } from "lucide-react";
import { getCategories, addCategory, deleteCategory } from "@/app/actions";

interface Category {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon: string | null;
    createdAt: Date | null;
}

export function ManageCategoriesDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"INCOME" | "EXPENSE">("EXPENSE");
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryIcon, setNewCategoryIcon] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const loadCategories = async () => {
        setIsLoading(true);
        const allCategories = await getCategories();
        setCategories(allCategories as Category[]);
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        await addCategory({
            name: newCategoryName.trim(),
            type: activeTab,
            icon: newCategoryIcon || undefined,
        });

        setNewCategoryName("");
        setNewCategoryIcon("");
        await loadCategories();
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;

        await deleteCategory(id);
        await loadCategories();
    };

    const filteredCategories = categories.filter(cat => cat.type === activeTab);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Kelola Kategori
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Kelola Kategori</DialogTitle>
                    <DialogDescription>
                        Tambah, edit, atau hapus kategori untuk transaksi Anda
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-2 border-b">
                        <button
                            onClick={() => setActiveTab("EXPENSE")}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === "EXPENSE"
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Pengeluaran
                        </button>
                        <button
                            onClick={() => setActiveTab("INCOME")}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === "INCOME"
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Pemasukan
                        </button>
                    </div>

                    {/* Add Category Form */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium mb-3">Tambah Kategori Baru</h3>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Nama kategori"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                                />
                            </div>
                            <div className="w-20">
                                <Input
                                    placeholder="🎯"
                                    value={newCategoryIcon}
                                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                                    maxLength={2}
                                    className="text-center"
                                />
                            </div>
                            <Button onClick={handleAddCategory} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah
                            </Button>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="border rounded-lg overflow-hidden">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Loading...
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Belum ada kategori. Tambahkan kategori pertama Anda!
                            </div>
                        ) : (
                            <div className="divide-y max-h-96 overflow-y-auto">
                                {filteredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            {category.icon && (
                                                <span className="text-2xl">{category.icon}</span>
                                            )}
                                            <span className="font-medium">{category.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteCategory(category.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
