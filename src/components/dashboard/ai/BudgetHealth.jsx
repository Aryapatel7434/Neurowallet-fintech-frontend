
import "./BudgetHealth.css";
import { FaChartLine, FaCircleCheck, FaTriangleExclamation } from "react-icons/fa6";

function BudgetHealth({ wallet, budgetHealth, loading }) {
    const formatCurrency = (amount) => {
        if (amount == null || amount === "") return "—";

        const value = Number(amount);
        if (!Number.isFinite(value)) return "—";

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (loading && !budgetHealth) {
        return (
            <section className="budget-card" aria-busy="true">
                <header className="budget-header">
                    <span className="budget-icon"><FaChartLine /></span>
                    <div>
                        <h2>Budget Health</h2>
                        <p>Monitoring your spending</p>
                    </div>
                </header>
                <div className="budget-loading">Loading budget analysis...</div>
            </section>
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

    const statusClass = String(status).toLowerCase().replace(/\s+/g, "-");

    const recommendation =
        status === "Excellent"
            ? "Excellent budgeting. Continue maintaining your current financial discipline."
            : status === "Healthy"
                ? "Your budget is healthy. Continue building your savings."
                : status === "Average"
                    ? "Review discretionary spending and monitor your expenses."
                    : status === "Critical"
                        ? "Your expenses need attention. Review your recorded spending."
                        : "Budget recommendations are unavailable until budget data is loaded.";

    const hasBudgetData = budgetHealth != null;

    return (
        <section className="budget-card">
            <header className="budget-header">
                <span className="budget-icon"><FaChartLine /></span>

                <div className="budget-heading">
                    <h2>Budget Health</h2>
                    <p>Your current budget status</p>
                </div>

                <span className={`budget-status budget-status--${statusClass}`}>
                    {status}
                </span>
            </header>

            <div className="budget-score-row">
                <div>
                    <span className="budget-eyebrow">BUDGET HEALTH</span>
                    <strong className="budget-percentage">
                        {percentage == null ? "—" : `${Math.round(percentage)}%`}
                    </strong>
                    <span className="budget-score-caption">
                        {percentage == null ? "Score unavailable" : "Financial health"}
                    </span>
                </div>

                <span className={`budget-score-icon ${percentage != null && percentage >= 50 ? "is-healthy" : "is-warning"}`}>
                    {percentage != null && percentage >= 50
                        ? <FaCircleCheck />
                        : <FaTriangleExclamation />}
                </span>
            </div>

            <div
                className="budget-progress"
                role="progressbar"
                aria-label="Budget health"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage ?? 0}
            >
                <div
                    className="budget-fill"
                    style={{ width: `${percentage ?? 0}%` }}
                />
            </div>

            <div className="budget-metrics">
                <div className="budget-metric">
                    <span>Spent</span>
                    <strong>{formatCurrency(expense)}</strong>
                </div>

                <div className="budget-metric">
                    <span>Remaining</span>
                    <strong>{formatCurrency(remaining)}</strong>
                </div>

                <div className="budget-metric">
                    <span>Income</span>
                    <strong>{formatCurrency(income)}</strong>
                </div>
            </div>

            <div className="budget-recommendation">
                <FaCircleCheck />
                <div>
                    <strong>AI Recommendation</strong>
                    <p>{recommendation}</p>
                </div>
            </div>

            <footer className="budget-footer">
                {hasBudgetData
                    ? "Based on your recorded financial activity"
                    : "Backend budget information unavailable"}
            </footer>
        </section>
    );
}

export default BudgetHealth;
