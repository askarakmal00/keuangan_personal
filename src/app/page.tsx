
import { getSummary, getTransactions, addTransaction, getInvestments } from "./actions";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, TrendingUp, TrendingDown, Target } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const summary = await getSummary();
  const recentTransactions = await getTransactions();
  const investments = await getInvestments();

  // Helper to format currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate investment portfolio growth
  const calculateInvestmentGrowth = () => {
    if (investments.length === 0) {
      return { totalCapital: 0, totalValue: 0, totalProfit: 0, growthPercentage: 0 };
    }

    const totalCapital = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
    const totalProfit = totalValue - totalCapital;
    const growthPercentage = totalCapital > 0 ? ((totalProfit / totalCapital) * 100).toFixed(2) : 0;

    return { totalCapital, totalValue, totalProfit, growthPercentage };
  };

  const investmentGrowth = calculateInvestmentGrowth();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Balance Card - Coral Orange */}
        <Card className="bg-gradient-to-br from-orange-400 to-orange-500 border-0 text-white shadow-lg" style={{
          backgroundImage: 'linear-gradient(135deg, #F5824A 0%, #e8722f 100%)'
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Balance</CardTitle>
            <Wallet className="h-5 w-5 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(summary.balance)}</div>
            <p className="text-xs text-white/90">Available funds</p>
          </CardContent>
        </Card>

        {/* Income Card - Dark Green */}
        <Card className="border-0 text-white shadow-lg" style={{
          backgroundImage: 'linear-gradient(135deg, #254F22 0%, #1a3818 100%)'
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Income</CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(summary.income)}</div>
            <p className="text-xs text-white/90">This month</p>
          </CardContent>
        </Card>

        {/* Expense Card - Burnt Orange */}
        <Card className="border-0 text-white shadow-lg" style={{
          backgroundImage: 'linear-gradient(135deg, #A03A13 0%, #7a2d0e 100%)'
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(summary.expense)}</div>
            <p className="text-xs text-white/90">This month</p>
          </CardContent>
        </Card>

        {/* Investments Card - Combination: Green to Coral */}
        <Card className="border-0 text-white shadow-lg" style={{
          backgroundImage: 'linear-gradient(135deg, #254F22 0%, #F5824A 100%)'
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Investments</CardTitle>
            <TrendingUp className="h-5 w-5 text-white/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(summary.totalInvestment)}</div>
            <p className="text-xs text-white/90">Current value</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Growth Summary */}
      {investments.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Investasi</CardTitle>
            <CardDescription>Ringkasan performa investasi Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Modal</p>
                <p className="text-lg font-bold">{formatIDR(investmentGrowth.totalCapital)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nilai Saat Ini</p>
                <p className="text-lg font-bold">{formatIDR(investmentGrowth.totalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Profit/Loss</p>
                <p className={`text-lg font-bold ${Number(investmentGrowth.totalProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(investmentGrowth.totalProfit) >= 0 ? '+' : ''}{formatIDR(investmentGrowth.totalProfit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overall Growth</p>
                <div className="flex items-center gap-1">
                  {Number(investmentGrowth.growthPercentage) >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <p className={`text-lg font-bold ${Number(investmentGrowth.growthPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(investmentGrowth.growthPercentage) >= 0 ? '+' : ''}{investmentGrowth.growthPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <DashboardCharts
        expenseData={summary.expenseChartData}
        incomeData={summary.incomeChartData}
      />

      {/* Debts Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hutang (Payable)</CardTitle>
            <CardDescription>Uang yang harus anda bayar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatIDR(summary.payable)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Piutang (Receivable)</CardTitle>
            <CardDescription>Uang anda di orang lain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatIDR(summary.receivable)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 md:col-span-7">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto space-y-8">
              {recentTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No transactions yet.</p>
              ) : (
                recentTransactions.map((t) => (
                  <div className="flex items-center" key={t.id}>
                    <div className={`space-y-1 rounded-full p-2 ${t.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {t.type === 'INCOME' ? <ArrowUpCircle className="h-4 w-4 text-green-600" /> : <ArrowDownCircle className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{t.description || t.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} • {t.date ? format(new Date(t.date), "dd MMM yyyy") : 'No Date'}
                      </p>
                    </div>
                    <div className={`ml-auto font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? "+" : "-"}{formatIDR(t.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
