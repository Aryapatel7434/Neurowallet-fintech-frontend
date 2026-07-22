import "./FinancialScore.css";

import {
    FaShieldHeart,
    FaCircleCheck
} from "react-icons/fa6";

function FinancialScore({
    wallet,
    financialScore,
    loading
}) {

    const balance = wallet?.balance || 0;

    if (loading) {
        return (
            <div className="score-card">

                <div className="score-header">

                    <h2>
                        <FaShieldHeart />
                        Financial Score
                    </h2>

                    <span className="score-live">
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
                    Calculating AI Financial Score...
                </div>

            </div>
        );
    }

    const score = financialScore?.score ?? 0;

    const status =
        financialScore?.rating ??
        "Unknown";

  const remark =
    financialScore?.remark ?? "";

const risk =
    financialScore?.risk ?? "Unknown";
    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);

    let creditRating = "B";

    if (score >= 95)
        creditRating = "A++";
    else if (score >= 90)
        creditRating = "A+";
    else if (score >= 75)
        creditRating = "A";
    else if (score >= 60)
        creditRating = "B++";


  const recommendation =
    financialScore?.remark ??
    "Improve your savings to increase your financial score.";

    return (

        <div className="score-card">

            {/* Header */}

            <div className="score-header">

                <h2>

                    <FaShieldHeart />

                    Financial Score

                </h2>

                <span className="score-live">

                    LIVE AI

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

                    {creditRating}

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

                    <span>

                        Wallet

                    </span>

                    <strong>

                        {formatCurrency(balance)}

                    </strong>

                </div>

                <div>

                    <span>

                        Rating

                    </span>

                    <strong>

                       {status}

                    </strong>

                </div>

                <div>

                    <span>

                        Risk

                    </span>

                    <strong>

                        {risk}

                    </strong>

                </div>

            </div>

            {/* Recommendation */}

           <div className="score-tip">

    <FaCircleCheck />

    <p>

        {recommendation}

    </p>

</div>

        </div>

    );

}

export default FinancialScore;