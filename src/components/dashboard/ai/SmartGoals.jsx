import "./SmartGoals.css";

import {
    FaBullseye,
    FaFlagCheckered,
    FaCircleCheck
} from "react-icons/fa6";

function SmartGoals({ wallet }) {

    const balance = wallet?.balance || 0;

    const goalAmount = 100000;

    const progress = Math.min(
        Math.round((balance / goalAmount) * 100),
        100
    );

    const remaining = goalAmount - balance;

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

                    Goal Completed

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

                    <span>Current</span>

                    <strong>

                        ₹{balance.toLocaleString("en-IN")}

                    </strong>

                </div>

                <div>

                    <span>Target</span>

                    <strong>

                        ₹{goalAmount.toLocaleString("en-IN")}

                    </strong>

                </div>

                <div>

                    <span>Remaining</span>

                    <strong>

                        ₹{remaining.toLocaleString("en-IN")}

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

                        {progress >= 80
                            ? "You're close to achieving your savings goal. Keep maintaining your current financial discipline."
                            : progress >= 50
                            ? "Excellent progress. Continue saving consistently to reach your target."
                            : "Increase your monthly savings to accelerate goal completion."}

                    </p>

                </div>

            </div>

            {/* ================= FOOTER ================= */}

            <div className="goal-footer">

                <FaFlagCheckered />

                <span>

                    Target: ₹1,00,000

                </span>

            </div>

        </div>

    );

}

export default SmartGoals;