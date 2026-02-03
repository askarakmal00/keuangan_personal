
import { getSummary, getGoals, getInvestments, getDebts } from "./actions";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp, Target, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const dynamic = 'force-dynamic'; // Disable static rendering

export default async function Home() {
  const summary = await getSummary();
  const goals = await getGoals();
  const investments = await getInvestments();
  const debts = await getDebts();

  // Helper to format currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate income/expense percentages for progress bars
  const totalFlow = summary.income + summary.expense;
  const incomePercentage = totalFlow > 0 ? (summary.income / totalFlow) * 100 : 0;
  const expensePercentage = totalFlow > 0 ? (summary.expense / totalFlow) * 100 : 0;

  // Calculate goals summary
  const totalGoalsTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalsProgress = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalsProgressPercentage = totalGoalsTarget > 0 ? (totalGoalsProgress / totalGoalsTarget) * 100 : 0;

  // Calculate investment summary
  const totalInvestmentCapital = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
  const investmentProfit = totalInvestmentValue - totalInvestmentCapital;
  const investmentGrowthPercentage = totalInvestmentCapital > 0 ? (investmentProfit / totalInvestmentCapital) * 100 : 0;

  // Calculate debts summary
  const totalPayable = debts.filter(d => d.type === "PAYABLE" && !d.isPaid).reduce((sum, d) => sum + d.amount, 0);
  const totalReceivable = debts.filter(d => d.type === "RECEIVABLE" && !d.isPaid).reduce((sum, d) => sum + d.amount, 0);
  const netDebt = totalPayable - totalReceivable;
  const payableCount = debts.filter(d => d.type === "PAYABLE" && !d.isPaid).length;
  const receivableCount = debts.filter(d => d.type === "RECEIVABLE" && !d.isPaid).length;

  return (
    <div className="space-y-6">
      {/* First Row - Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Balance Card */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
            <div className="h-10 w-10 rounded-full bg-cyan-50 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatIDR(summary.balance)}</div>
            <p className="text-xs text-gray-500 mt-1">Available funds</p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <ArrowUpCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatIDR(summary.income)}</div>
            <Progress value={incomePercentage} className="h-1.5 mt-3 bg-gray-100" indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <ArrowDownCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatIDR(summary.expense)}</div>
            <Progress value={expensePercentage} className="h-1.5 mt-3 bg-gray-100" indicatorClassName="bg-red-500" />
          </CardContent>
        </Card>

        {/* Investments Summary */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Investasi</CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatIDR(totalInvestmentValue)}</div>
            <p className={`text-xs font-medium mt-1 ${investmentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {investmentProfit >= 0 ? '+' : ''}{formatIDR(investmentProfit)} ({investmentGrowthPercentage >= 0 ? '+' : ''}{investmentGrowthPercentage.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Goals & Debts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Goals Summary */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600">Impian & Target</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">{goals.length} impian aktif</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{formatIDR(totalGoalsProgress)}</div>
                <p className="text-xs text-gray-500">dari {formatIDR(totalGoalsTarget)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={goalsProgressPercentage} className="h-2 bg-gray-100" indicatorClassName="bg-purple-500" />
            <p className="text-xs text-gray-500 mt-2">{goalsProgressPercentage.toFixed(1)}% tercapai</p>
          </CardContent>
        </Card>

        {/* Debts Summary */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-sm font-medium text-gray-600">Hutang & Piutang</CardTitle>
              </div>
              <div className={`text-xl font-bold ${netDebt > 0 ? 'text-red-600' : netDebt < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatIDR(Math.abs(netDebt))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-gray-600 mb-0.5">Hutang</p>
                <p className="text-sm font-bold text-red-600">{formatIDR(totalPayable)}</p>
                <p className="text-xs text-gray-500">{payableCount} item</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-xs text-gray-600 mb-0.5">Piutang</p>
                <p className="text-sm font-bold text-green-600">{formatIDR(totalReceivable)}</p>
                <p className="text-xs text-gray-500">{receivableCount} item</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts
        expenseChartData={summary.expenseChartData}
        incomeChartData={summary.incomeChartData}
      />
    </div>
  );
}
