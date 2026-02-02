
import { getInvestments, deleteInvestment, updateInvestmentValue, getSummary } from "@/app/actions";
import { AddInvestmentForm } from "@/components/add-investment-form";
import { UpdateInvestmentDialog } from "@/components/update-investment-dialog";
import { WithdrawInvestmentDialog } from "@/components/withdraw-investment-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Trash2, Wallet } from "lucide-react";

export default async function InvestmentsPage() {
    const investments = await getInvestments();
    const summary = await getSummary();

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateProfit = (initial: number, current: number | null) => {
        const currentValue = current || initial;
        const profit = currentValue - initial;
        const percentage = ((profit / initial) * 100).toFixed(2);
        return { profit, percentage };
    };

    // Calculate overall portfolio performance
    const calculatePortfolioSummary = () => {
        if (investments.length === 0) {
            return { totalCapital: 0, totalValue: 0, totalProfit: 0, growthPercentage: 0 };
        }

        const totalCapital = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
        const totalProfit = totalValue - totalCapital;
        const growthPercentage = totalCapital > 0 ? ((totalProfit / totalCapital) * 100).toFixed(2) : 0;

        return { totalCapital, totalValue, totalProfit, growthPercentage };
    };

    const portfolioSummary = calculatePortfolioSummary();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Investasi</h1>
            </div>

            {/* Balance Display */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sisa Saldo</p>
                            <p className="text-2xl font-bold">{formatIDR(summary.balance)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Investment Portfolio Summary */}
            {investments.length > 0 && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Ringkasan Portfolio Investasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Modal</p>
                                <p className="text-lg font-bold">{formatIDR(portfolioSummary.totalCapital)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Nilai Saat Ini</p>
                                <p className="text-lg font-bold">{formatIDR(portfolioSummary.totalValue)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Profit/Loss</p>
                                <p className={`text-lg font-bold ${Number(portfolioSummary.totalProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Number(portfolioSummary.totalProfit) >= 0 ? '+' : ''}{formatIDR(portfolioSummary.totalProfit)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Growth</p>
                                <div className="flex items-center gap-1">
                                    {Number(portfolioSummary.growthPercentage) >= 0 ? (
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                    )}
                                    <p className={`text-lg font-bold ${Number(portfolioSummary.growthPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(portfolioSummary.growthPercentage) >= 0 ? '+' : ''}{portfolioSummary.growthPercentage}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <AddInvestmentForm />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Portofolio Investasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[500px] overflow-y-auto space-y-4">
                            {investments.length === 0 ? (
                                <p className="text-center text-muted-foreground">Belum ada investasi.</p>
                            ) : (
                                investments.map((inv) => {
                                    const { profit, percentage } = calculateProfit(inv.amount, inv.currentValue);
                                    const isProfit = profit >= 0;

                                    return (
                                        <div className="border-b pb-4 last:border-0 last:pb-0" key={inv.id}>
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{inv.name}</p>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                                            {inv.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Modal: {formatIDR(inv.amount)} • Nilai: {formatIDR(inv.currentValue || inv.amount)}
                                                    </p>
                                                    <div className={`flex items-center gap-1 text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                                        {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                        <span>{isProfit ? '+' : ''}{formatIDR(profit)} ({percentage}%)</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 flex-wrap justify-end">
                                                    <UpdateInvestmentDialog
                                                        investmentId={inv.id}
                                                        currentValue={inv.currentValue || inv.amount}
                                                        investmentName={inv.name}
                                                    />
                                                    <WithdrawInvestmentDialog
                                                        investmentId={inv.id}
                                                        investmentName={inv.name}
                                                        initialAmount={inv.amount}
                                                        currentValue={inv.currentValue || inv.amount}
                                                    />
                                                    <form action={async () => {
                                                        "use server";
                                                        await deleteInvestment(inv.id);
                                                    }}>
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

