
import "./SmartGoals.css";

import {
    FaBullseye,
    FaFlagCheckered,
    FaCircleCheck,
    FaPiggyBank,
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

    if (loading && !goalRecommendation) {
        return (
            <section className="goal-card" aria-busy="true">
                <header className="goal-header">
                    <span className="goal-icon"><FaBullseye /></span>
                    <div className="goal-heading">
                        <h2>Savings Goals</h2>
                        <p>Track your financial goals</p>
                    </div>
                </header>
                <div className="goal-loading">Loading savings goal...</div>
            </section>
        );
    }

    const goalName = goalRecommendation?.goalName;
    const targetAmount = goalRecommendation?.targetAmount;
    const currentAmount = goalRecommendation?.currentAmount;

    const target = Number(targetAmount);
    const current = Number(currentAmount);
    const rawProgress = Number(goalRecommendation?.progressPercentage);

    const hasAmounts =
        targetAmount != null &&
        currentAmount != null &&
        targetAmount !== "" &&
        currentAmount !== "" &&
        Number.isFinite(target) &&
        Number.isFinite(current) &&
        target > 0;

    const hasProgress =
        goalRecommendation?.progressPercentage != null &&
        goalRecommendation.progressPercentage !== "" &&
        Number.isFinite(rawProgress);

    const progress = hasProgress
        ? Math.min(100, Math.max(0, rawProgress))
        : hasAmounts
            ? Math.min(100, Math.max(0, (current / target) * 100))
            : null;

    const progressValue = progress == null ? 0 : Math.round(progress);

    const remaining = hasAmounts
        ? Math.max(0, target - current)
        : null;

    const nextMilestone = progress == null
        ? null
        : [25, 50, 75, 100].find((value) => progress < value) ?? null;

    const nextMilestoneAmount =
        hasAmounts && nextMilestone != null
            ? Math.max(0, (target * nextMilestone) / 100 - current)
            : null;

    const status =
        progress == null ? "Unavailable" :
        progress >= 100 ? "Completed" :
        progress >= 75 ? "Almost there" :
        progress >= 40 ? "Good progress" : "In progress";

    const recommendation =
        typeof goalRecommendation?.recommendation === "string"
            ? goalRecommendation.recommendation.trim()
            : "";

    const hasGoal =
        goalRecommendation != null &&
        Boolean(goalName || hasAmounts || hasProgress);

    return (
        <section className="goal-card">
            <header className="goal-header">
                <span className="goal-icon"><FaBullseye /></span>

                <div className="goal-heading">
                    <h2>Savings Goals</h2>
                    <p>Track your financial goals</p>
                </div>

                <span className={`goal-status ${hasGoal ? "is-active" : "is-unavailable"}`}>
                    {hasGoal ? "ACTIVE" : "UNAVAILABLE"}
                </span>
            </header>

            {hasGoal ? (
                <>
                    <div className="goal-main">
                        <div className="goal-main-info">
                            <span className="goal-eyebrow">
                                {goalName || "Your savings goal"}
                            </span>

                            <strong className="goal-percentage">
                                {progress == null ? "—" : `${progressValue}%`}
                            </strong>

                            <span className="goal-progress-label">{status}</span>
                        </div>

                        <div
                            className="goal-ring"
                            style={{
                                "--goal-progress": `${progressValue * 3.6}deg`,
                            }}
                            role="progressbar"
                            aria-label="Savings goal progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progress ?? 0}
                        >
                            <div>
                                <strong>{progress == null ? "—" : `${progressValue}%`}</strong>
                                <small>Saved</small>
                            </div>
                        </div>
                    </div>

                    <div className="goal-progress-track">
                        <div
                            className="goal-progress-fill"
                            style={{ width: `${progressValue}%` }}
                        />
                    </div>

                    <div className="goal-metrics">
                        <div>
                            <span>Saved</span>
                            <strong>{formatCurrency(currentAmount)}</strong>
                        </div>

                        <div>
                            <span>Target</span>
                            <strong>{formatCurrency(targetAmount)}</strong>
                        </div>

                        <div>
                            <span>Remaining</span>
                            <strong>{formatCurrency(remaining)}</strong>
                        </div>
                    </div>

                    <div className="goal-next">
                        <span className="goal-next-icon"><FaFlagCheckered /></span>

                        <div>
                            <strong>
                                {nextMilestone == null
                                    ? progress == null
                                        ? "Milestone unavailable"
                                        : "Goal completed"
                                    : `Next milestone · ${nextMilestone}%`}
                            </strong>

                            <p>
                                {nextMilestoneAmount != null
                                    ? `${formatCurrency(nextMilestoneAmount)} more to reach your next milestone.`
                                    : progress >= 100
                                        ? "You have reached your savings target."
                                        : "Add valid goal amounts to calculate your next milestone."}
                            </p>
                        </div>
                    </div>

                    {recommendation && (
                        <div className="goal-insight">
                            <FaCircleCheck />
                            <p>{recommendation}</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="goal-empty">
                    <FaPiggyBank />
                    <strong>No goal recommendation available</strong>
                    <p>Your savings goal information will appear here when available.</p>
                </div>
            )}

            <footer className="goal-footer">
                <span><FaPiggyBank /> Savings overview</span>
                <strong>{progress == null ? "—" : `${progressValue}% complete`}</strong>
            </footer>
        </section>
    );
}

export default SmartGoals;
