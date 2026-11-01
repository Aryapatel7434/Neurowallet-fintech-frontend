import { useMemo, useState } from "react";
import {
    FaArrowRight,
    FaMagnifyingGlassChart,
    FaShieldHalved,
    FaSpinner,
    FaTriangleExclamation,
} from "react-icons/fa6";

import { getTransactionFraudAnalysis } from "../../../services/aiService";
import "./TransactionRiskMonitor.css";

function getDate(transaction) {
    const value =
        transaction?.timestamp ||
        transaction?.createdAt ||
        transaction?.date;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(transaction) {
    const date = getDate(transaction);

    if (!date) return "Date unavailable";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
}

function getRiskClass(level) {
    const normalized = String(level || "").toUpperCase();

    return ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(normalized)
        ? normalized.toLowerCase()
        : "unknown";
}

export default function TransactionRiskMonitor({ transactions = [] }) {
    const [results, setResults] = useState({});
    const [errors, setErrors] = useState({});
    const [loadingId, setLoadingId] = useState(null);

    // Keep this panel intentionally compact: show only the two latest
    // transactions. Analysis is requested only when the user clicks.
    const recentTransactions = useMemo(() => {
        return [...transactions]
            .filter((transaction) => {
                const id = Number(transaction?.transactionId);
                return Number.isSafeInteger(id) && id > 0;
            })
            .sort((a, b) => {
                const aDate = getDate(a)?.getTime() || 0;
                const bDate = getDate(b)?.getTime() || 0;
                return bDate - aDate;
            })
            .slice(0, 4);
    }, [transactions]);

    const analyzeTransaction = async (transaction) => {
        const id = Number(transaction?.transactionId);

        if (!Number.isSafeInteger(id) || id <= 0 || loadingId !== null) {
            return;
        }

        setLoadingId(id);
        setErrors((current) => ({ ...current, [id]: "" }));

        try {
            const response = await getTransactionFraudAnalysis(id);

            if (!response || !response.riskLevel) {
                throw new Error("The risk analysis response was incomplete.");
            }

            setResults((current) => ({ ...current, [id]: response }));
        } catch (error) {
            setErrors((current) => ({
                ...current,
                [id]:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    "Risk analysis could not be completed.",
            }));
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <section
            className="nw-transaction-risk-panel"
            aria-label="Transaction risk monitor"
        >
            <header className="nw-transaction-risk-header">
                <div className="nw-transaction-risk-title">
                    <span className="nw-transaction-risk-eyebrow">
                        SECURITY INTELLIGENCE
                    </span>
                    <h3>Transaction Risk</h3>
                    <p>On-demand fraud assessment</p>
                </div>

                <span className="nw-transaction-risk-header-icon">
                    <FaShieldHalved aria-hidden="true" />
                </span>
            </header>

            <div className="nw-transaction-risk-summary">
                <FaMagnifyingGlassChart aria-hidden="true" />
                <span>
                  Reviewing the <strong>{recentTransactions.length} latest transactions</strong>
                </span>
            </div>

            {recentTransactions.length ? (
                <div className="nw-transaction-risk-list">
                    {recentTransactions.map((transaction) => {
                        const id = Number(transaction.transactionId);
                        const result = results[id];
                        const error = errors[id];
                        const isLoading = loadingId === id;
                        const riskClass = getRiskClass(result?.riskLevel);
                        const score = Number(result?.riskScore);

                        return (
                            <article
                                className="nw-transaction-risk-item"
                                key={id}
                            >
                                <div className="nw-transaction-risk-main">
                                    <div className="nw-transaction-risk-identity">
                                        <strong>Transaction #{id}</strong>
                                        <span>{formatDate(transaction)}</span>
                                    </div>

                                    <strong className="nw-transaction-risk-amount">
                                        {formatCurrency(transaction.amount)}
                                    </strong>
                                </div>

                                {result ? (
                                    <div className="nw-transaction-risk-result">
                                        <div className="nw-transaction-risk-result-top">
                                            <span className={`nw-risk-badge nw-risk-${riskClass}`}>
                                                {String(result.riskLevel).toUpperCase()}
                                            </span>

                                            {Number.isFinite(score) && (
                                                <span className="nw-risk-score">
                                                    Score {score}/100
                                                </span>
                                            )}
                                        </div>

                                        {result.reason && (
                                            <p className="nw-risk-reason">
                                                {result.reason}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="nw-transaction-risk-unreviewed">
                                        Not yet analyzed
                                    </span>
                                )}

                                {error && (
                                    <p className="nw-transaction-risk-error" role="alert">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="nw-transaction-risk-button"
                                    onClick={() => analyzeTransaction(transaction)}
                                    disabled={loadingId !== null}
                                >
                                    {isLoading ? (
                                        <>
                                            <FaSpinner className="nw-risk-spinner" />
                                            Analyzing
                                        </>
                                    ) : (
                                        <>
                                            {result ? "Re-analyze" : "Analyze risk"}
                                            <FaArrowRight aria-hidden="true" />
                                        </>
                                    )}
                                </button>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="nw-transaction-risk-empty">
                    No eligible transactions are available for review.
                </div>
            )}

            <footer className="nw-transaction-risk-footer">
                <FaTriangleExclamation aria-hidden="true" />
                <span>
                    Risk results are assessments, not confirmation of fraud.
                </span>
            </footer>
        </section>
    );
}
