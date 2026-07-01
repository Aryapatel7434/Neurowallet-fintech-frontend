import "./FinancialScore.css";

import {
    FaShieldHeart,
    FaArrowTrendUp,
    FaCircleCheck
} from "react-icons/fa6";

function FinancialScore({ wallet }) {

    const balance = wallet?.balance || 0;

   const score =
    balance >= 100000
        ? 98
        : balance >= 50000
        ? 90
        : balance >= 25000
        ? 82
        : balance >= 10000
        ? 70
        : balance >= 5000
        ? 58
        : 40;

  const status =
    score >= 95
        ? "Elite"
        : score >= 90
        ? "Excellent"
        : score >= 75
        ? "Good"
        : score >= 60
        ? "Average"
        : "Needs Improvement";

    return (

        <div className="score-card">

            {/* Header */}

            <div className="score-header">

                <h2>

                    <FaShieldHeart />

                    Financial Score

                </h2>

                <span className="score-live">

                    LIVE

                </span>

            </div>

            {/* Main Score */}

            <div className="score-main">

                <h1>

                    {score}

                </h1>

                <span>

                    /100

                </span>

            </div>

            <p className="score-status">

                {status}

            </p>
            <div className="score-badge">

    Credit Rating

    <strong>

        {score >= 95
            ? "  A++"
            : score >= 85
            ? "  A+"
            : score >= 70
            ? "  A"
            : score >= 55
            ? "  B++"
            : "  B+"}

    </strong>

</div>

            {/* Progress */}

            <div className="score-progress">

                <div
                    className="score-fill"
                    style={{
                        width: `${score}%`
                    }}
                />

            </div>

            {/* Metrics */}

            <div className="score-metrics">

                <div>

                    <span>Wallet</span>

                    <strong>

                        ₹{balance.toLocaleString("en-IN")}

                    </strong>

                </div>

                <div>

                    <span>Rating</span>

                    <strong>

                        A+

                    </strong>

                </div>

                <div>

                    <span>Risk</span>

                    <strong>

                        Low

                    </strong>

                </div>

            </div>

            {/* Recommendation */}

            <div className="score-tip">

                <FaCircleCheck />

                <p>

                   {score >= 90
    ? "Excellent financial discipline. Continue your current saving strategy to maintain a top credit profile."
    : score >= 75
    ? "Healthy financial behavior. Increasing your monthly savings can further improve your score."
    : "Focus on reducing unnecessary expenses and increasing savings to improve your financial health."}
                </p>

            </div>

        </div>

    );

}

export default FinancialScore;