import "./SmartGoals.css";

import {
    FaBullseye,
    FaFlagCheckered,
    FaCircleCheck,
    FaPiggyBank,
    FaArrowTrendUp,
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
                    <div className="goal-title-wrap">
                        <span className="goal-title-icon"><FaBullseye /></span>
                        <div>
                            <h2>Savings Goals</h2>
                            <p>Track your savings progress</p>
                        </div>
                    </div>
                    <span className="goal-live">Loading...</span>
                </div>
                <div className="goal-loading">
                    <span className="goal-loading-icon"><FaPiggyBank /></span>
                    <p>Loading your savings goal...</p>
                </div>
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
        Number.isFinite(current) &&
        target > 0;

    const progress =
        goalRecommendation?.progressPercentage != null &&
        goalRecommendation.progressPercentage !== "" &&
        Number.isFinite(rawProgress)
            ? Math.min(100, Math.max(0, rawProgress))
            : hasAmounts
                ? Math.min(100, Math.max(0, (current / target) * 100))
                : null;

    const remaining = hasAmounts ? Math.max(0, target - current) : null;
    const savedAmount = hasAmounts ? Math.max(0, Math.min(current, target)) : null;
    const savedPercentage = hasAmounts
        ? Math.min(100, Math.max(0, (savedAmount / target) * 100))
        : 0;
    const remainingPercentage = hasAmounts ? 100 - savedPercentage : 0;

    const recommendation =
        goalRecommendation?.recommendation ??
        "A savings recommendation is not available yet.";

    const progressLabel =
        progress == null ? "Progress unavailable" :
        progress >= 100 ? "Goal completed" :
        progress >= 75 ? "Almost there" :
        progress >= 40 ? "Good progress" : "Getting started";

    const progressValue = progress == null ? 0 : Math.round(progress);

    const goalStatus =
        progress == null ? "Waiting for goal data" :
        progress >= 100 ? "Target achieved" :
        progress >= 75 ? "Final stretch" :
        progress >= 40 ? "On your way" : "Building momentum";

    return (
        <div className="goal-card">
            <div className="goal-header">
                <div className="goal-title-wrap">
                    <span className="goal-title-icon"><FaBullseye /></span>
                    <div>
                        <h2>Savings Goals</h2>
                        <p>Track your savings progress</p>
                    </div>
                </div>
                <span className="goal-live">
                    {hasGoal ? "ACTIVE" : "UNAVAILABLE"}
                </span>
            </div>

            <section className="goal-progress-panel">
                <div className="goal-progress-main">
                    <div>
                        <span className="goal-eyebrow">{goalName ?? "Your savings goal"}</span>
                        <h3>{progress == null ? "—" : `${progressValue}%`}</h3>
                        <span className="goal-progress-label">{progressLabel}</span>
                    </div>

                    <div
                        className="goal-progress-ring"
                        style={{
                            background: `conic-gradient(#22c55e ${progressValue * 3.6}deg, #263a52 0deg)`,
                        }}
                        role="progressbar"
                        aria-label="Savings goal progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress ?? 0}
                    >
                        <div>
                            <strong>{progress == null ? "—" : `${progressValue}%`}</strong>
                            <span>Saved</span>
                        </div>
                    </div>
                </div>

                <div className="goal-progress-track">
                    <div
                        className="goal-fill"
                        style={{ width: `${progressValue}%` }}
                    />
                </div>
            </section>

            <div className="goal-metrics">
                <div>
                    <span>Saved so far</span>
                    <strong>{formatCurrency(goalRecommendation?.currentAmount)}</strong>
                </div>
                <div>
                    <span>Target amount</span>
                    <strong>{formatCurrency(goalRecommendation?.targetAmount)}</strong>
                </div>
                <div>
                    <span>Still needed</span>
                    <strong>{formatCurrency(remaining)}</strong>
                </div>
            </div>

            <section className="goal-funding-panel">
                <div className="goal-funding-heading">
                    <span className="goal-funding-icon"><FaPiggyBank /></span>
                    <div>
                        <span>GOAL FUNDING BREAKDOWN</span>
                        <h3>Where you stand</h3>
                    </div>
                    <span className="goal-funding-status">{goalStatus}</span>
                </div>

                <div
                    className="goal-funding-bar"
                    role="img"
                    aria-label={
                        hasAmounts
                            ? `${Math.round(savedPercentage)} percent saved and ${Math.round(remainingPercentage)} percent remaining`
                            : "Goal funding breakdown unavailable"
                    }
                >
                    <span
                        className="goal-funding-saved"
                        style={{ width: `${savedPercentage}%` }}
                    />
                    <span
                        className="goal-funding-remaining"
                        style={{ width: `${remainingPercentage}%` }}
                    />
                </div>

                <div className="goal-funding-legend">
                    <div className="goal-funding-item">
                        <span className="goal-legend-label">
                            <i className="goal-legend-dot saved" />
                            Already saved
                        </span>
                        <strong>{hasAmounts ? `${Math.round(savedPercentage)}%` : "—"}</strong>
                        <small>{formatCurrency(savedAmount)}</small>
                    </div>

                    <div className="goal-funding-item">
                        <span className="goal-legend-label">
                            <i className="goal-legend-dot remaining" />
                            Left to save
                        </span>
                        <strong>{hasAmounts ? `${Math.round(remainingPercentage)}%` : "—"}</strong>
                        <small>{formatCurrency(remaining)}</small>
                    </div>
                </div>

                <div className="goal-funding-note">
                    <FaArrowTrendUp />
                    <span>
                        {hasAmounts
                            ? progress >= 100
                                ? "Your savings have reached the target. Keep building healthy financial habits."
                                : `${formatCurrency(remaining)} remains before you reach your savings target.`
                            : "Add valid goal amounts to view your funding breakdown."}
                    </span>
                </div>
            </section>

            <div className="goal-tip">
                <FaCircleCheck />
                <div>
                    <h4>AI Goal Insight</h4>
                    <p>{recommendation}</p>
                </div>
            </div>

            <div className="goal-footer">
                <div>
                    <FaFlagCheckered />
                    <span>{goalName ?? "Savings goal unavailable"}</span>
                </div>
                <strong>
                    {progress == null ? "Progress unavailable" : `${progressValue}% completed`}
                </strong>
            </div>
        </div>
    );
}

export default SmartGoals;
