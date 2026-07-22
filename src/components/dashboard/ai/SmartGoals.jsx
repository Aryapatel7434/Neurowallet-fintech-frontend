import "./SmartGoals.css";

import {
    FaBullseye,
    FaFlagCheckered,
    FaCircleCheck
} from "react-icons/fa6";

function SmartGoals({
    goalRecommendation,
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

            <div className="goal-card">

                <div className="goal-header">

                    <h2>

                        <FaBullseye />

                        Smart Goal

                    </h2>

                    <span className="goal-live">

                        Loading...

                    </span>

                </div>

                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                        fontWeight: "600"
                    }}
                >
                    Loading Smart Goal...
                </div>

            </div>

        );

    }

    const goalName =
        goalRecommendation?.goalName ??
        "Emergency Fund";

    const target =
        goalRecommendation?.targetAmount ?? 0;

    const current =
        goalRecommendation?.currentAmount ?? 0;

    const progress =
        goalRecommendation?.progressPercentage ?? 0;

    const recommendation =
        goalRecommendation?.recommendation ??
        "No recommendation available.";

    const remaining =
        Math.max(0, target - current);

    return (

        <div className="goal-card">

            {/* ================= HEADER ================= */}

            <div className="goal-header">

                <h2>

                    <FaBullseye />

                    Smart Goal

                </h2>

                <span className="goal-live">

                    LIVE

                </span>

            </div>

            {/* ================= PROGRESS ================= */}

            <div className="goal-progress-section">

                <h1>

                    {progress}%

                </h1>

                <p>

                    {progress >= 100
                        ? "Goal Completed"
                        : progress >= 75
                        ? "Almost There"
                        : progress >= 40
                        ? "Good Progress"
                        : "Start Saving"}

                </p>

            </div>

            <div className="goal-progress">

                <div
                    className="goal-fill"
                    style={{
                        width: `${progress}%`
                    }}
                />

            </div>

            {/* ================= METRICS ================= */}

            <div className="goal-metrics">

                <div>

                    <span>

                        Current

                    </span>

                    <strong>

                        {formatCurrency(current)}

                    </strong>

                </div>

                <div>

                    <span>

                        Target

                    </span>

                    <strong>

                        {formatCurrency(target)}

                    </strong>

                </div>

                <div>

                    <span>

                        Remaining

                    </span>

                    <strong>

                        {formatCurrency(remaining)}

                    </strong>

                </div>

            </div>

            {/* ================= RECOMMENDATION ================= */}

            <div className="goal-tip">

                <FaCircleCheck />

                <div>

                    <h4>

                        Goal Recommendation

                    </h4>

                    <p>

                        {recommendation}

                    </p>

                </div>

            </div>

            {/* ================= FOOTER ================= */}

            <div className="goal-footer">

                <FaFlagCheckered />

                <span>

                    Goal: {goalName}

                </span>

            </div>

        </div>

    );

}

export default SmartGoals;