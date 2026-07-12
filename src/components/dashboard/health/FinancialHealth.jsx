import { FaShieldHeart } from "react-icons/fa6";
function FinancialHealth({
    wallet,
    transactions = [],
}) {

    const balance = wallet?.balance || 0;

    const totalTransactions = transactions.length;

    /* ===========================
       Financial Health Score
    =========================== */

    let score = 50;

    // Wallet Balance Score
    if (balance >= 100000) {
        score += 25;
    } else if (balance >= 50000) {
        score += 15;
    } else if (balance >= 10000) {
        score += 10;
    }

    // Transaction Activity Score
    if (totalTransactions >= 50) {
        score += 15;
    } else if (totalTransactions >= 20) {
        score += 10;
    }

    score = Math.min(score, 100);

    const progress = score;

    /* ===========================
       Trend
    =========================== */

    const trend =
        score >= 90
            ? "+12%"
            : score >= 75
            ? "+8%"
            : score >= 60
            ? "+4%"
            : "-3%";

    /* ===========================
       Expense Status
    =========================== */

    const expenseStatus =
        score >= 80
            ? "Excellent"
            : score >= 65
            ? "Stable"
            : "Needs Attention";

    /* ===========================
       Health Status
    =========================== */

    const healthStatus =
        score >= 80
            ? "Excellent"
            : score >= 70
            ? "Good"
            : score >= 50
            ? "Average"
            : "Needs Improvement";

    return (

        <div className="health-card">

            {/* Header */}

            <div className="health-header">

                <div>

                   <h3 className="health-title">

    <FaShieldHeart className="health-title-icon" />

    Financial Health Score

</h3>

                    <p>
                        Real-time financial health based on your wallet and transaction history.
                    </p>

                </div>

                <div className="health-percent">

                    {progress}%

                </div>

            </div>

            {/* Progress */}

            <div className="progress-wrapper">

                <div className="progress-bar">

                    <div
                        className="progress-fill"
                        style={{
                            width: `${progress}%`,
                        }}
                    ></div>

                </div>

            </div>

            {/* Score */}

    <div className="score-section">

    <div className="score-circle">

        <span className="health-score-label">
            HEALTH SCORE
        </span>

        <h1 className="health-score">

            {score}

        </h1>

        <span
            className={`health-status ${
                score >= 80
                    ? "excellent"
                    : score >= 70
                    ? "good"
                    : score >= 50
                    ? "average"
                    : "poor"
            }`}
        >

            {
                score >= 80
                    ? "Excellent"
                    : score >= 70
                    ? "Good"
                    : score >= 50
                    ? "Average"
                    : "Poor"
            }

        </span>

    </div>

    <p className="health-message">

        {
            score >= 80
                ? "Outstanding financial stability."
                : score >= 70
                ? "Healthy financial discipline."
                : score >= 50
                ? "Continue improving your savings."
                : "Reduce expenses and increase savings."
        }

    </p>

</div>

            {/* Metrics */}

            <div className="health-metrics">

    <div className="metric-box">

        <label>Trend</label>

        <strong>{trend}</strong>

    </div>

    <div className="metric-box">

        <label>Expense Health</label>

        <strong>{expenseStatus}</strong>

    </div>

    <div className="metric-box">

        <label>Next Target</label>

        <strong>{Math.min(score + 10,100)}</strong>

    </div>

</div>

<div className="health-summary">

    <h4>

        🤖 AI Health Summary

    </h4>

    <ul>

        <li>

            Wallet Balance:
            <strong>

                ₹{balance.toLocaleString("en-IN")}

            </strong>

        </li>

        <li>

            Transactions:
            <strong>

                {totalTransactions}

            </strong>

        </li>

        <li>

            Status:
            <strong>

                {expenseStatus}

            </strong>

        </li>

    </ul>

</div>
<div className="health-footer">

    <FaShieldHeart />

    <span>

        Updated using live backend analytics

    </span>

</div>
        </div>

    );
}

export default FinancialHealth;