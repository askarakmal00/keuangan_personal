"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, CheckCircle, XCircle } from "lucide-react";
import { parseCSV, downloadCSVTemplate, type TransactionRow } from "@/lib/csv-parser";
import { bulkAddTransactions } from "@/app/actions";

export function BulkUploadDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<TransactionRow[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setErrors([]);
        setPreviewData([]);
        setUploadSuccess(false);

        const text = await selectedFile.text();
        const result = parseCSV(text);

        if (result.success) {
            setPreviewData(result.data);
        } else {
            setErrors(result.errors);
        }

        if (result.errors.length > 0 && result.data.length > 0) {
            setErrors(result.errors);
            setPreviewData(result.data);
        }
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setIsUploading(true);
        try {
            await bulkAddTransactions(previewData);
            setUploadSuccess(true);
            setPreviewData([]);
            setFile(null);
            setErrors([]);

            // Auto close after success
            setTimeout(() => {
                setIsOpen(false);
                setUploadSuccess(false);
            }, 2000);
        } catch (error) {
            setErrors([`Error importing: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        } finally {
            setIsUploading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreviewData([]);
        setErrors([]);
        setUploadSuccess(false);
    };

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Transaksi</DialogTitle>
                    <DialogDescription>
                        Upload file CSV untuk menambahkan banyak transaksi sekaligus
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Download Template Button */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={downloadCSVTemplate}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download Template CSV
                        </Button>
                    </div>

                    {/* File Input */}
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                        >
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Klik untuk upload file CSV</p>
                                <p className="text-sm text-muted-foreground">
                                    {file ? file.name : 'Format: date,type,category,amount,description'}
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Success Message */}
                    {uploadSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Import berhasil!</span>
                        </div>
                    )}

                    {/* Errors */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-2 text-red-800 mb-2">
                                <XCircle className="h-5 w-5 mt-0.5" />
                                <span className="font-medium">Error ditemukan:</span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                {errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Preview Table */}
                    {previewData.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">
                                Preview Data ({previewData.length} transaksi)
                            </h3>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Tanggal</th>
                                                <th className="px-4 py-2 text-left">Type</th>
                                                <th className="px-4 py-2 text-left">Kategori</th>
                                                <th className="px-4 py-2 text-right">Amount</th>
                                                <th className="px-4 py-2 text-left">Deskripsi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((row, idx) => (
                                                <tr key={idx} className="border-t hover:bg-gray-50">
                                                    <td className="px-4 py-2">{new Date(row.date).toLocaleDateString('id-ID')}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${row.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {row.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">{row.category}</td>
                                                    <td className="px-4 py-2 text-right font-medium">{formatIDR(row.amount)}</td>
                                                    <td className="px-4 py-2 text-muted-foreground">{row.description || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {previewData.length > 0 && (
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={isUploading}
                            >
                                Reset
                            </Button>
                            <Button
                                type="button"
                                onClick={handleImport}
                                disabled={isUploading || errors.length > 0}
                                className="gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        Import {previewData.length} Transaksi
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
