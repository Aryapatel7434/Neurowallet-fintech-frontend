
import "./FinancialScore.css";

import {
    FaShieldHeart,
    FaCircleCheck,
} from "react-icons/fa6";

function FinancialScore({ wallet, financialScore, loading }) {
    const balance = Number(wallet?.balance ?? 0);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(Number.isFinite(amount) ? amount : 0);

    if (loading) {
        return (
            <div className="score-card" aria-busy="true">
                <div className="score-header">
                    <h2>
                        <FaShieldHeart /> Financial Score
                    </h2>
                    <span className="score-live">Loading...</span>
                </div>

                <p>Calculating AI Financial Score...</p>
            </div>
        );
    }

    // Do not display fabricated score values if the API data is absent.
    const hasScore =
        financialScore?.score !== null &&
        financialScore?.score !== undefined &&
        Number.isFinite(Number(financialScore.score));

    const score = hasScore
        ? Math.min(100, Math.max(0, Number(financialScore.score)))
        : null;

    const status = financialScore?.rating ?? "Unavailable";
    const risk = financialScore?.risk ?? "Unavailable";
    const recommendation =
        financialScore?.remark ?? "No recommendation is available.";

    let creditRating = "—";

    if (score !== null) {
        if (score >= 95) creditRating = "A++";
        else if (score >= 90) creditRating = "A+";
        else if (score >= 75) creditRating = "A";
        else if (score >= 60) creditRating = "B++";
        else creditRating = "B";
    }

    return (
        <div className="score-card">
            <div className="score-header">
                <h2>
                    <FaShieldHeart /> Financial Score
                </h2>
                <span className="score-live">
                    {hasScore ? "LIVE AI" : "DATA UNAVAILABLE"}
                </span>
            </div>

            <div className="score-main">
                <h1>{score ?? "—"}</h1>
                <span>/100</span>
            </div>

            <p className="score-status">{status}</p>

            <div className="score-badge">
                Credit Rating
                <strong>{creditRating}</strong>
            </div>

            <div
                className="score-progress"
                role="progressbar"
                aria-label="Financial score"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score ?? 0}
            >
                <div
                    className="score-fill"
                    style={{ width: `${score ?? 0}%` }}
                />
            </div>

            <div className="score-metrics">
                <div>
                    <span>Wallet</span>
                    <strong>{formatCurrency(balance)}</strong>
                </div>

                <div>
                    <span>Rating</span>
                    <strong>{status}</strong>
                </div>

                <div>
                    <span>Risk</span>
                    <strong>{risk}</strong>
                </div>
            </div>

            <div className="score-tip">
                <FaCircleCheck />
                <p>{recommendation}</p>
            </div>
        </div>
    );
}

export default FinancialScore;
