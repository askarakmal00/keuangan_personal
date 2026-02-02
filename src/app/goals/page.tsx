
import { getGoals, deleteGoal, getSummary } from "@/app/actions";
import { AddGoalForm } from "@/components/add-goal-form";
import { ContributeGoalDialog } from "@/components/contribute-goal-dialog";
import { WithdrawGoalDialog } from "@/components/withdraw-goal-dialog";
import { GoalBreakdownDialog } from "@/components/goal-breakdown-dialog";
import { EditGoalBreakdownDialog } from "@/components/edit-goal-breakdown-dialog";
import { GoalCoverImage } from "@/components/goal-cover-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Target, Trash2, Calendar, Wallet } from "lucide-react";

export const revalidate = 0; // Force revalidation on every request
export const dynamic = 'force-dynamic'; // Disable static rendering

export default async function GoalsPage() {
    const goals = await getGoals();
    const summary = await getSummary();

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Impian & Target</h1>
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

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <AddGoalForm />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Impian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[500px] overflow-y-auto space-y-6">
                            {goals.length === 0 ? (
                                <p className="text-center text-muted-foreground">Belum ada impian.</p>
                            ) : (
                                goals.map((goal) => {
                                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                                    const isComplete = progress >= 100;

                                    return (
                                        <div className="space-y-3 border-b pb-6 last:border-0 last:pb-0" key={goal.id}>
                                            {/* Cover Image */}
                                            {goal.coverImage && (
                                                <GoalCoverImage
                                                    src={goal.coverImage}
                                                    alt={goal.name}
                                                />
                                            )}

                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Target className="h-5 w-5 text-blue-600" />
                                                        <p className="font-semibold text-lg">{goal.name}</p>
                                                    </div>
                                                    {goal.deadline && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Target: {format(new Date(goal.deadline), "dd MMM yyyy")}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteGoal(goal.id);
                                                }}>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                                                        {progress.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <Progress value={Math.min(progress, 100)} className="h-2" />
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-blue-600">{formatIDR(goal.currentAmount)}</span>
                                                    <span className="text-muted-foreground">/ {formatIDR(goal.targetAmount)}</span>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-2 justify-center flex-wrap">
                                                <GoalBreakdownDialog
                                                    goalId={goal.id}
                                                    goalName={goal.name}
                                                />
                                                <EditGoalBreakdownDialog
                                                    goalId={goal.id}
                                                    goalName={goal.name}
                                                    currentTarget={goal.targetAmount}
                                                />
                                                {!isComplete && (
                                                    <ContributeGoalDialog
                                                        goalId={goal.id}
                                                        goalName={goal.name}
                                                    />
                                                )}
                                                {goal.currentAmount > 0 && (
                                                    <WithdrawGoalDialog
                                                        goalId={goal.id}
                                                        goalName={goal.name}
                                                        currentAmount={goal.currentAmount}
                                                    />
                                                )}
                                            </div>

                                            {isComplete && (
                                                <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center">
                                                    <p className="text-sm font-medium text-green-800">🎉 Selamat! Target tercapai!</p>
                                                </div>
                                            )}
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

