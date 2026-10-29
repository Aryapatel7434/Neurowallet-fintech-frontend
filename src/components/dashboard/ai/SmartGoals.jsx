
import "./SmartGoals.css";

import {
    FaBullseye,
    FaFlagCheckered,
    FaCircleCheck,
} from "react-icons/fa6";

function SmartGoals({ goalRecommendation, loading }) {
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

    if (loading) {
        return (
            <div className="goal-card" aria-busy="true">
                <div className="goal-header">
                    <h2>
                        <FaBullseye /> Savings Goals
                    </h2>
                    <span className="goal-live">Loading...</span>
                </div>
                <p>Loading your savings goal...</p>
            </div>
        );
    }

    const hasGoal = goalRecommendation != null;

    const goalName = goalRecommendation?.goalName;
    const target = Number(goalRecommendation?.targetAmount);
    const current = Number(goalRecommendation?.currentAmount);
    const rawProgress = Number(goalRecommendation?.progressPercentage);

    const hasAmounts =
        goalRecommendation?.targetAmount != null &&
        goalRecommendation?.currentAmount != null &&
        Number.isFinite(target) &&
        Number.isFinite(current);

    const progress = Number.isFinite(rawProgress)
        ? Math.min(100, Math.max(0, rawProgress))
        : hasAmounts && target > 0
          ? Math.min(100, Math.max(0, (current / target) * 100))
          : null;

    const remaining =
        hasAmounts ? Math.max(0, target - current) : null;

    const recommendation =
        goalRecommendation?.recommendation ??
        "A savings recommendation is not available yet.";

    const progressLabel =
        progress == null
            ? "Progress unavailable"
            : progress >= 100
              ? "Goal completed"
              : progress >= 75
                ? "Almost there"
                : progress >= 40
                  ? "Good progress"
                  : "Getting started";

    return (
        <div className="goal-card">
            <div className="goal-header">
                <h2>
                    <FaBullseye /> Savings Goals
                </h2>
                <span className="goal-live">
                    {hasGoal ? "LIVE" : "UNAVAILABLE"}
                </span>
            </div>

            <div className="goal-progress-section">
                <h1>
                    {progress == null ? "—" : `${Math.round(progress)}%`}
                </h1>
                <p>{progressLabel}</p>
            </div>

            <div
                className="goal-progress"
                role="progressbar"
                aria-label="Savings goal progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress ?? 0}
            >
                <div
                    className="goal-fill"
                    style={{ width: `${progress ?? 0}%` }}
                />
            </div>

            <div className="goal-metrics">
                <div>
                    <span>Current</span>
                    <strong>{formatCurrency(goalRecommendation?.currentAmount)}</strong>
                </div>

                <div>
                    <span>Target</span>
                    <strong>{formatCurrency(goalRecommendation?.targetAmount)}</strong>
                </div>

                <div>
                    <span>Remaining</span>
                    <strong>{formatCurrency(remaining)}</strong>
                </div>
            </div>

            <div className="goal-tip">
                <FaCircleCheck />
                <div>
                    <h4>Goal Recommendation</h4>
                    <p>{recommendation}</p>
                </div>
            </div>

            <div className="goal-footer">
                <FaFlagCheckered />
                <span>Goal: {goalName ?? "Unavailable"}</span>
            </div>
        </div>
    );
}

export default SmartGoals;
