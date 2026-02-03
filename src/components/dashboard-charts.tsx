"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ChartData {
    name: string;
    value: number;
}

interface DashboardChartsProps {
    expenseChartData: ChartData[];
    incomeChartData: ChartData[];
}

// Warm color palette for charts
const EXPENSE_COLORS = ['#F28482', '#F6BD60', '#F5CAC3', '#84A59D', '#D4A5A5', '#FFD4A3', '#C9ADA7', '#9EC1B4'];
const INCOME_COLORS = ['#84A59D', '#F6BD60', '#F5CAC3', '#9EC1B4', '#FFD4A3', '#C9ADA7', '#A4C3B2', '#F7D9C4'];

export function DashboardCharts({ expenseChartData, incomeChartData }: DashboardChartsProps) {
    // Helper to format currency
    const formatIDR = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Sort data by value descending (highest first)
    const sortedExpenseData = [...expenseChartData].sort((a, b) => b.value - a.value);
    const sortedIncomeData = [...incomeChartData].sort((a, b) => b.value - a.value);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-4 py-2 shadow-lg rounded-lg border">
                    <p className="font-semibold">{payload[0].payload.name}</p>
                    <p className="text-sm text-muted-foreground">{formatIDR(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Expense Chart - Horizontal Bars */}
            <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Pengeluaran per Kategori</CardTitle>
                    <CardDescription>Distribusi pengeluaran Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        {sortedExpenseData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={sortedExpenseData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => formatIDR(value)} />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                        {sortedExpenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Tidak ada data pengeluaran
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Income Chart - Horizontal Bars */}
            <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Pemasukan per Kategori</CardTitle>
                    <CardDescription>Sumber pendapatan Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        {sortedIncomeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={sortedIncomeData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => formatIDR(value)} />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                        {sortedIncomeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Tidak ada data pemasukan
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
