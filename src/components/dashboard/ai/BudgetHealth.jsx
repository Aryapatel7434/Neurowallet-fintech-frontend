import "./BudgetHealth.css";
import { FaChartLine, FaCircleCheck } from "react-icons/fa6";

function BudgetHealth({
    wallet,
    budgetHealth,
    loading
}) {

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);

    if (loading) {
        return (
            <div className="budget-card">
                <div className="budget-header">
                    <h2>
                        <FaChartLine />
                        Budget Health
                    </h2>

                    <span className="budget-live">
                        Loading...
                    </span>
                </div>

                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                        fontWeight: "600",
                    }}
                >
                    Fetching AI Budget Analysis...
                </div>
            </div>
        );
    }
const rawPercentage =
    budgetHealth?.healthPercentage ?? 0;

const displayPercentage =
    rawPercentage <= 0
        ? 5
        : Math.min(100, rawPercentage);

const percentage =
    rawPercentage <= 0
        ? 0
        : Math.min(100, rawPercentage);

    const remaining =
        budgetHealth?.remainingBudget ?? 0;

    const status =
        budgetHealth?.status ??
        "Unknown";

const income =
    budgetHealth?.totalIncome ?? 0;

const expense =
    budgetHealth?.totalExpense ?? 0;

const totalBudget = income;

const spent = expense;

    let recommendation;

switch (status) {

    case "Excellent":
        recommendation =
            "Excellent budgeting! Continue your current financial discipline.";
        break;

    case "Healthy":
        recommendation =
            "Your budget is healthy. Try increasing your monthly savings.";
        break;

    case "Average":
        recommendation =
            "Monitor your expenses and reduce unnecessary spending.";
        break;

    default:
        recommendation =
            "Critical budget alert! Focus on reducing spending immediately.";
}

    return (

        <div className="budget-card">

            {/* Header */}

            <div className="budget-header">

                <h2>

                    <FaChartLine />

                    Budget Health

                </h2>

                <span className="budget-live">

                    LIVE AI

                </span>

            </div>

            {/* Progress */}

            <div className="budget-progress">

                <div
                    className="budget-fill"
                    style={{
                        width: `${percentage}%`,
                        
                    }}
                />

            </div>

            {/* Score */}

            <div className="budget-score">

                <h3>

                    {percentage.toFixed(0)}%

                </h3>

                <p>

                    {status}

                </p>

            </div>

            {/* Metrics */}

            <div className="budget-metrics">

                <div>

                    <span>

                        Spent

                    </span>

                    <strong className="money-value">

                        {formatCurrency(spent)}

                    </strong>

                </div>

                <div>

                    <span>

                        Remaining

                    </span>

                    <strong className="money-value">

                        {formatCurrency(remaining)}

                    </strong>

                </div>

                <div>

                    <span>

                        Budget

                    </span>

                    <strong className="money-value">

                        {formatCurrency(totalBudget)}

                    </strong>

                </div>

            </div>

            {/* Recommendation */}

            <div className="budget-recommendation">

                <FaCircleCheck />

                <div>

                    <h4>

                        AI Recommendation

                    </h4>

                    <p>

                        {recommendation}

                    </p>

                </div>

            </div>

        </div>

    );

}

export default BudgetHealth;