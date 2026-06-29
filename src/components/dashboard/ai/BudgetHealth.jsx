import "./BudgetHealth.css";
import { FaChartLine, FaCircleCheck } from "react-icons/fa6";

function BudgetHealth({ wallet }) {

    const balance = wallet?.balance || 0;

    // Demo Budget
    const totalBudget = 100000;

    const spent = totalBudget - balance;

    const remaining = balance;

    const score =
        balance > 50000
            ? 90
            : balance > 20000
            ? 75
            : balance > 5000
            ? 60
            : 35;

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    return (

        <div className="budget-card">

            {/* Header */}

            <div className="budget-header">

                <h2>

                    <FaChartLine />

                    Budget Health

                </h2>

                <span className="budget-live">

                    LIVE

                </span>

            </div>

            {/* Progress */}

            <div className="budget-progress">

                <div
                    className="budget-fill"
                    style={{
                        width: `${score}%`,
                    }}
                />

            </div>

            {/* Score */}

            <div className="budget-score">

                <h3>{score}%</h3>

                <p>

                    {score >= 80
                        ? "Excellent Financial Position"
                        : score >= 60
                        ? "Healthy Spending"
                        : "Budget Needs Attention"}

                </p>

            </div>

            {/* Metrics */}

            <div className="budget-metrics">

                <div>

                    <span>Spent</span>

                    <strong className="money-value">

                        {formatCurrency(spent)}

                    </strong>

                </div>

                <div>

                    <span>Remaining</span>

                    <strong className="money-value">

                        {formatCurrency(remaining)}

                    </strong>

                </div>

                <div>

                    <span>Budget</span>

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

                        Recommendation

                    </h4>

                    <p>

                        Maintain your current spending pattern.
                        Your financial health remains strong.

                    </p>

                </div>

            </div>

        </div>

    );

}

export default BudgetHealth;