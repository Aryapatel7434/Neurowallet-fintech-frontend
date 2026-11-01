
import { useMemo } from "react";
import {
    FaArrowTrendUp,
    FaArrowTrendDown,
    FaWallet,
    FaChartLine,
    FaCircleInfo,
} from "react-icons/fa6";

import "./CashFlowInsights.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const formatCurrency = (value) =>
    currencyFormatter.format(Number(value) || 0);

function getCurrentUserEmail() {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        return String(user.email || "")
            .trim()
            .toLowerCase();
    } catch {
        return "";
    }
}

function getTransactionDate(transaction) {
    const value =
        transaction.timestamp ??
        transaction.createdAt ??
        transaction.date;

    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function CashFlowInsights({ transactions = [] }) {
    const email = useMemo(() => getCurrentUserEmail(), []);

    const insights = useMemo(() => {
        const now = new Date();

        const currentMonthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const sixMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() - 5,
            1
        );

        const summary = {
            income: 0,
            expenses: 0,
            currentIncome: 0,
            currentExpenses: 0,
            successfulCount: 0,
            monthsWithActivity: new Set(),
        };

        if (!email) return summary;

        transactions.forEach((transaction) => {
            if (
                String(transaction.status || "")
                    .trim()
                    .toUpperCase() !== "SUCCESS"
            ) {
                return;
            }

            const amount = Number(transaction.amount);

            if (!Number.isFinite(amount) || amount <= 0) {
                return;
            }

            const date = getTransactionDate(transaction);

            if (!date || date < sixMonthStart || date > now) {
                return;
            }

            const sender = String(
                transaction.senderEmail || ""
            ).trim().toLowerCase();

            const receiver = String(
                transaction.receiverEmail || ""
            ).trim().toLowerCase();

            const outgoing = sender === email;
            const incoming = receiver === email;

            // Ignore transactions that cannot be attributed
            // unambiguously to the current user.
            if (outgoing === incoming) return;

            summary.successfulCount += 1;

            const monthKey =
                `${date.getFullYear()}-${date.getMonth()}`;

            summary.monthsWithActivity.add(monthKey);

            if (incoming) {
                summary.income += amount;

                if (date >= currentMonthStart) {
                    summary.currentIncome += amount;
                }
            }

            if (outgoing) {
                summary.expenses += amount;

                if (date >= currentMonthStart) {
                    summary.currentExpenses += amount;
                }
            }
        });

        return summary;
    }, [transactions, email]);

    const netCashFlow = insights.income - insights.expenses;

    const currentMonthNet =
        insights.currentIncome - insights.currentExpenses;

    const monthsCount = Math.max(
        1,
        insights.monthsWithActivity.size
    );

    const averageMonthlyIncome =
        insights.income / monthsCount;

    const averageMonthlyExpenses =
        insights.expenses / monthsCount;

    const savingsRate =
        insights.income > 0
            ? ((insights.income - insights.expenses) /
                insights.income) * 100
            : null;

    const positiveCashFlow = netCashFlow >= 0;

    if (!email) {
        return (
            <section className="nw-cash-insights">
                <div className="nw-cash-insights-empty">
                    <FaCircleInfo aria-hidden="true" />
                    <p>
                        Sign in to view your personalized cash flow insights.
                    </p>
                </div>
            </section>
        );
    }

    if (insights.successfulCount === 0) {
        return (
            <section className="nw-cash-insights">
                <header className="nw-cash-insights-header">
                    <div>
                        <span className="nw-cash-insights-eyebrow">
                            FINANCIAL INTELLIGENCE
                        </span>
                        <h3>Cash Flow Insights</h3>
                    </div>

                    <span className="nw-cash-insights-icon">
                        <FaChartLine aria-hidden="true" />
                    </span>
                </header>

                <div className="nw-cash-insights-empty">
                    <FaCircleInfo aria-hidden="true" />
                    <p>
                        Your cash flow insights will appear when successful
                        transactions are available.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="nw-cash-insights">
            <header className="nw-cash-insights-header">
                <div>
                    <span className="nw-cash-insights-eyebrow">
                        FINANCIAL INTELLIGENCE
                    </span>
                    <h3>Cash Flow Insights</h3>
                    <p>Last six months of activity</p>
                </div>

                <span className="nw-cash-insights-icon">
                    <FaChartLine aria-hidden="true" />
                </span>
            </header>

            <div className="nw-cash-insights-net">
                <div className="nw-cash-insights-net-heading">
                    <span>Six-month net cash flow</span>
                    <span className={
                        positiveCashFlow
                            ? "nw-cash-flow-indicator positive"
                            : "nw-cash-flow-indicator negative"
                    }>
                        {positiveCashFlow ? "Positive" : "Negative"}
                    </span>
                </div>

                <strong className={
                    positiveCashFlow ? "is-positive" : "is-negative"
                }>
                    {formatCurrency(netCashFlow)}
                </strong>

                <span className="nw-cash-insights-caption">
                    {positiveCashFlow
                        ? "Recorded income is higher than expenses."
                        : "Recorded expenses are higher than income."}
                </span>
            </div>

            <div className="nw-cash-insights-metrics">
                <article className="nw-cash-metric">
                    <span className="nw-cash-metric-icon income">
                        <FaArrowTrendUp aria-hidden="true" />
                    </span>

                    <div className="nw-cash-metric-content">
                        <span>Avg. monthly income</span>
                        <strong>{formatCurrency(averageMonthlyIncome)}</strong>
                    </div>
                </article>

                <article className="nw-cash-metric">
                    <span className="nw-cash-metric-icon expense">
                        <FaArrowTrendDown aria-hidden="true" />
                    </span>

                    <div className="nw-cash-metric-content">
                        <span>Avg. monthly expenses</span>
                        <strong>{formatCurrency(averageMonthlyExpenses)}</strong>
                    </div>
                </article>

                <article className="nw-cash-metric">
                    <span className="nw-cash-metric-icon balance">
                        <FaWallet aria-hidden="true" />
                    </span>

                    <div className="nw-cash-metric-content">
                        <span>Current month net</span>
                        <strong className={
                            currentMonthNet >= 0
                                ? "is-positive"
                                : "is-negative"
                        }>
                            {formatCurrency(currentMonthNet)}
                        </strong>
                    </div>
                </article>
            </div>

            <footer className="nw-cash-insights-footer">
                <span>Savings rate</span>

                <strong className={
                    savingsRate !== null && savingsRate >= 0
                        ? "is-positive"
                        : "is-negative"
                }>
                    {savingsRate === null
                        ? "Unavailable"
                        : `${savingsRate.toFixed(1)}%`}
                </strong>
            </footer>

            <p className="nw-cash-insights-disclaimer">
                Based on successful transactions in the loaded six-month
                history. Historical summary, not a financial forecast.
            </p>
        </section>
    );
}

export default CashFlowInsights;
