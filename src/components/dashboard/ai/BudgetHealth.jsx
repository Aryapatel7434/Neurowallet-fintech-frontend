
import "./BudgetHealth.css";
import { FaChartLine, FaCircleCheck } from "react-icons/fa6";

function BudgetHealth({ wallet, budgetHealth, loading }) {
    const formatCurrency = (amount) => {
        const value = Number(amount);

        if (amount == null || amount === "" || !Number.isFinite(value)) {
            return "—";
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="budget-card" aria-busy="true">
                <div className="budget-header">
                    <h2>
                        <FaChartLine /> Budget Health
                    </h2>
                    <span className="budget-live">Loading...</span>
                </div>

                <div style={{ padding: "24px", textAlign: "center" }}>
                    Fetching AI Budget Analysis...
                </div>
            </div>
        );
    }

    const rawPercentage = Number(budgetHealth?.healthPercentage);
    const hasPercentage =
        budgetHealth?.healthPercentage != null &&
        budgetHealth.healthPercentage !== "" &&
        Number.isFinite(rawPercentage);

    const percentage = hasPercentage
        ? Math.min(100, Math.max(0, rawPercentage))
        : null;

    const status = budgetHealth?.status ?? "Unavailable";
    const income = budgetHealth?.totalIncome;
    const expense = budgetHealth?.totalExpense;
    const remaining = budgetHealth?.remainingBudget;

    // Income is displayed as the reported total, not assumed to be
    // a user-defined budget.
    let recommendation = "Budget information is currently unavailable.";

    if (status === "Excellent") {
        recommendation =
            "Excellent budgeting! Continue your current financial discipline.";
    } else if (status === "Healthy") {
        recommendation =
            "Your budget is healthy. Consider increasing your savings if it fits your goals.";
    } else if (status === "Average") {
        recommendation =
            "Monitor your expenses and review unnecessary spending.";
    } else if (status === "Critical") {
        recommendation =
            "Your budget is marked critical. Review your recorded expenses.";
    }

    const hasBudgetData = budgetHealth != null;

    return (
        <div className="budget-card">
            <div className="budget-header">
                <h2>
                    <FaChartLine /> Budget Health
                </h2>
                <span className="budget-live">
                    {hasBudgetData ? "LIVE AI" : "DATA UNAVAILABLE"}
                </span>
            </div>

            <div
                className="budget-progress"
                role="progressbar"
                aria-label="Budget health percentage"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage ?? 0}
            >
                <div
                    className="budget-fill"
                    style={{ width: `${percentage ?? 0}%` }}
                />
            </div>

            <div className="budget-score">
                <h3>{percentage == null ? "—" : `${percentage}%`}</h3>
                <p>{status}</p>
            </div>

            <div className="budget-metrics">
                <div>
                    <span>Spent</span>
                    <strong className="money-value">
                        {formatCurrency(expense)}
                    </strong>
                </div>

                <div>
                    <span>Remaining</span>
                    <strong className="money-value">
                        {formatCurrency(remaining)}
                    </strong>
                </div>

                <div>
                    <span>Income</span>
                    <strong className="money-value">
                        {formatCurrency(income)}
                    </strong>
                </div>
            </div>

            <div className="budget-recommendation">
                <FaCircleCheck />
                <div>
                    <h4>AI Recommendation</h4>
                    <p>{recommendation}</p>
                </div>
            </div>
        </div>
    );
}

export default BudgetHealth;
