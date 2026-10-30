import "./GoalRecommendation.css";

import {
    FaLightbulb,
    FaBullseye,
    FaCircleCheck,
    FaArrowTrendUp,
    FaFlagCheckered,
    FaLock,
    FaArrowRight,
} from "react-icons/fa6";

function GoalRecommendation({ goalRecommendation, loading }) {
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
            <div className="recommend-card" aria-busy="true">
                <div className="recommend-header">
                    <div className="recommend-title-wrap">
                        <span className="recommend-title-icon"><FaLightbulb /></span>
                        <div>
                            <h2>AI Recommendation</h2>
                            <p>Personalized savings guidance</p>
                        </div>
                    </div>
                    <span className="recommend-live">Loading...</span>
                </div>

                <div className="recommend-loading">
                    <div className="recommend-loading-icon"><FaLightbulb /></div>
                    <p>Generating your financial recommendation...</p>
                </div>
            </div>
        );
    }

    const hasGoal = goalRecommendation != null;
    const goalName = goalRecommendation?.goalName;
    const targetAmount = goalRecommendation?.targetAmount;
    const currentAmount = goalRecommendation?.currentAmount;

    const target = Number(targetAmount);
    const current = Number(currentAmount);
    const rawProgress = Number(goalRecommendation?.progressPercentage);

    const hasAmounts =
        targetAmount != null &&
        currentAmount != null &&
        Number.isFinite(target) &&
        Number.isFinite(current);

    const progress =
        goalRecommendation?.progressPercentage != null &&
        goalRecommendation.progressPercentage !== "" &&
        Number.isFinite(rawProgress)
            ? Math.min(100, Math.max(0, rawProgress))
            : hasAmounts && target > 0
                ? Math.min(100, Math.max(0, (current / target) * 100))
                : null;

    const remaining =
        hasAmounts && target > 0 ? Math.max(0, target - current) : null;

    const recommendation =
        goalRecommendation?.recommendation ??
        "No recommendation is available yet.";

    const progressLabel =
        progress == null ? "Progress unavailable" :
        progress >= 100 ? "Goal completed" :
        progress >= 75 ? "Almost there" :
        progress >= 40 ? "Good progress" : "Getting started";

    const progressValue = progress == null ? 0 : Math.round(progress);

    // Milestones are calculated from the goal's target amount and current progress.
    // They do not assume a monthly savings rate or predict a completion date.
    const milestoneValues = [25, 50, 75, 100];
    const nextMilestone = progress == null
        ? null
        : milestoneValues.find((milestone) => progress < milestone) ?? null;

    const nextMilestoneAmount =
        hasAmounts && target > 0 && nextMilestone != null
            ? Math.max(0, (target * nextMilestone) / 100 - current)
            : null;

    return (
        <div className="recommend-card">
            <div className="recommend-header">
                <div className="recommend-title-wrap">
                    <span className="recommend-title-icon"><FaLightbulb /></span>
                    <div>
                        <h2>AI Recommendation</h2>
                        <p>Personalized savings guidance</p>
                    </div>
                </div>
                <span className="recommend-live">
                    {hasGoal ? "LIVE AI" : "UNAVAILABLE"}
                </span>
            </div>

            <section className="recommend-progress-panel">
                <div className="recommend-progress-heading">
                    <div>
                        <span className="recommend-eyebrow">CURRENT GOAL PROGRESS</span>
                        <h3>{progress == null ? "—" : `${progressValue}%`}</h3>
                        <span className="recommend-progress-label">{progressLabel}</span>
                    </div>

                    <div
                        className="recommend-progress-ring"
                        style={{
                            background: `conic-gradient(#22c55e ${progressValue * 3.6}deg, #263a52 0deg)`,
                        }}
                        role="progressbar"
                        aria-label="Goal progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress ?? 0}
                    >
                        <div>
                            <strong>{progress == null ? "—" : `${progressValue}%`}</strong>
                            <span>Complete</span>
                        </div>
                    </div>
                </div>

                <div className="recommend-progress-track">
                    <div
                        className="recommend-progress-fill"
                        style={{ width: `${progressValue}%` }}
                    />
                </div>
            </section>

            <section className="recommend-goal-panel">
                <div className="recommend-goal-heading">
                    <FaBullseye />
                    <div>
                        <span>ACTIVE SAVINGS GOAL</span>
                        <h3>{goalName ?? "Goal unavailable"}</h3>
                    </div>
                </div>

                <div className="recommend-goal-metrics">
                    <div>
                        <span>Current savings</span>
                        <strong>{formatCurrency(currentAmount)}</strong>
                    </div>
                    <div>
                        <span>Target amount</span>
                        <strong>{formatCurrency(targetAmount)}</strong>
                    </div>
                    <div>
                        <span>Remaining</span>
                        <strong>{formatCurrency(remaining)}</strong>
                    </div>
                </div>
            </section>

            <section className="recommend-insight-panel">
                <div className="recommend-insight-heading">
                    <span className="recommend-insight-icon"><FaArrowTrendUp /></span>
                    <div>
                        <span>NEUROWALLET AI INSIGHT</span>
                        <h3>Recommended next step</h3>
                    </div>
                </div>
                <p>{recommendation}</p>
            </section>

            <section className="recommend-milestones" aria-label="Savings goal milestones">
                <div className="recommend-milestone-top">
                    <div>
                        <span className="recommend-section-kicker">YOUR SAVINGS JOURNEY</span>
                        <h3>Goal milestones</h3>
                    </div>
                    <span className="recommend-milestone-count">
                        {progress == null
                            ? "— / 4 reached"
                            : `${milestoneValues.filter((milestone) => progress >= milestone).length} / 4 reached`}
                    </span>
                </div>

                <div className="recommend-milestone-track">
                    {milestoneValues.map((milestone) => {
                        const reached = progress != null && progress >= milestone;
                        const milestoneAmount =
                            hasAmounts && target > 0
                                ? (target * milestone) / 100
                                : null;

                        return (
                            <div
                                className={`recommend-milestone ${reached ? "is-reached" : ""}`}
                                key={milestone}
                                aria-label={`${milestone}% milestone ${reached ? "reached" : "not reached"}`}
                            >
                                <span className="recommend-milestone-dot">
                                    {reached ? <FaCircleCheck /> : <FaLock />}
                                </span>
                                <strong>{milestone}%</strong>
                                <span className="recommend-milestone-amount">
                                    {formatCurrency(milestoneAmount)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="recommend-next-milestone">
                    <span className="recommend-next-icon"><FaFlagCheckered /></span>
                    {nextMilestone == null ? (
                        <div>
                            <strong>{progress == null ? "Milestone details unavailable" : "All milestones completed"}</strong>
                            <span>
                                {progress == null
                                    ? "Add valid goal amounts to calculate your milestones."
                                    : "You have reached your full savings target."}
                            </span>
                        </div>
                    ) : (
                        <div>
                            <strong>Next milestone: {nextMilestone}%</strong>
                            <span>
                                {nextMilestoneAmount == null
                                    ? "Keep building your savings to reach the next checkpoint."
                                    : `${formatCurrency(nextMilestoneAmount)} more to reach this checkpoint.`}
                            </span>
                        </div>
                    )}
                    {nextMilestone != null && (
                        <FaArrowRight className="recommend-next-arrow" />
                    )}
                </div>
            </section>

            <div className="recommend-footer">
                <div>
                    <FaCircleCheck />
                    <span>Generated by NeuroWallet AI</span>
                </div>
                <span className="recommend-footer-goal">
                    <FaFlagCheckered />
                    {progress == null
                        ? "Goal progress unavailable"
                        : `${progressValue}% completed`}
                </span>
            </div>
        </div>
    );
}

export default GoalRecommendation;
