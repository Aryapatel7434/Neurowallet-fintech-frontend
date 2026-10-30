
import "./BudgetHealth.css";
import { FaChartLine, FaCircleCheck } from "react-icons/fa6";

function BudgetHealth({ wallet, budgetHealth, loading }) {
    const formatCurrency = (amount) => {
        const value = Number(amount);

        if (
            amount == null ||
            amount === "" ||
            !Number.isFinite(value)
        ) {
            return "—";
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Loading state
    if (loading) {
        return (
            <div className="budget-card" aria-busy="true">
                <div className="budget-header">
                    <h2>
                        <FaChartLine /> Budget Health
                    </h2>

                    <span className="budget-live">
                        Loading...
                    </span>
                </div>

                <div className="budget-loading">
                    Fetching AI Budget Analysis...
                </div>
            </div>
        );
    }

    // Budget health percentage
    const rawPercentage = Number(
        budgetHealth?.healthPercentage
    );

    const hasPercentage =
        budgetHealth?.healthPercentage != null &&
        budgetHealth.healthPercentage !== "" &&
        Number.isFinite(rawPercentage);

    const percentage = hasPercentage
        ? Math.min(100, Math.max(0, rawPercentage))
        : null;

    // Backend budget information
    const status = budgetHealth?.status ?? "Unavailable";

    const income = budgetHealth?.totalIncome;
    const expense = budgetHealth?.totalExpense;
    const remaining = budgetHealth?.remainingBudget;

    const hasBudgetData = budgetHealth != null;

    // AI recommendation
    let recommendation =
        "Budget information is currently unavailable.";

    if (status === "Excellent") {
        recommendation =
            "Excellent budgeting! Continue your current financial discipline.";
    } else if (status === "Healthy") {
        recommendation =
            "Your budget is healthy. Consider increasing your savings if it fits your goals.";
    } else if (status === "Average") {
        recommendation =
            "Monitor your expenses and review unnecessary spending.";
    } else if (status === "Critical") {
        recommendation =
            "Your budget is marked critical. Review your recorded expenses.";
    }

    // =========================================
    // INCOME ALLOCATION
    // Derived from actual backend values
    // =========================================

    const numericIncome = Number(income);
    const numericExpense = Number(expense);

    const hasAllocationData =
        income != null &&
        income !== "" &&
        expense != null &&
        expense !== "" &&
        Number.isFinite(numericIncome) &&
        Number.isFinite(numericExpense) &&
        numericIncome > 0 &&
        numericExpense >= 0;

    const retainedIncome = hasAllocationData
        ? Math.max(0, numericIncome - numericExpense)
        : 0;

    const expensePercentage = hasAllocationData
        ? Math.min(
              100,
              (numericExpense / numericIncome) * 100
          )
        : 0;

    const retainedPercentage = hasAllocationData
        ? Math.max(0, 100 - expensePercentage)
        : 0;

    const allocationMessage = !hasAllocationData
        ? "Income allocation is unavailable."
        : numericExpense > numericIncome
          ? "Recorded expenses exceed recorded income."
          : "This is the portion of recorded income remaining after expenses.";

    return (
        <div className="budget-card">

            {/* =================================
                HEADER
            ================================= */}

            <div className="budget-header">
                <h2>
                    <FaChartLine />
                    Budget Health
                </h2>

                <span className="budget-live">
                    {hasBudgetData
                        ? "LIVE AI"
                        : "DATA UNAVAILABLE"}
                </span>
            </div>

            {/* =================================
                HEALTH PROGRESS
            ================================= */}

            <div
                className="budget-progress"
                role="progressbar"
                aria-label="Budget health percentage"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage ?? 0}
            >
                <div
                    className="budget-fill"
                    style={{
                        width: `${percentage ?? 0}%`,
                    }}
                />
            </div>

            {/* =================================
                HEALTH SCORE
            ================================= */}

            <div className="budget-score">
                <h3>
                    {percentage == null
                        ? "—"
                        : `${percentage}%`}
                </h3>

                <p>{status}</p>
            </div>

            {/* =================================
                FINANCIAL METRICS
            ================================= */}

            <div className="budget-metrics">

                <div>
                    <span>Spent</span>

                    <strong className="money-value">
                        {formatCurrency(expense)}
                    </strong>
                </div>

                <div>
                    <span>Remaining</span>

                    <strong className="money-value">
                        {formatCurrency(remaining)}
                    </strong>
                </div>

                <div>
                    <span>Income</span>

                    <strong className="money-value">
                        {formatCurrency(income)}
                    </strong>
                </div>

            </div>

            {/* =================================
                AI RECOMMENDATION
            ================================= */}

            <div className="budget-recommendation">

                <FaCircleCheck />

                <div>
                    <h4>AI Recommendation</h4>

                    <p>{recommendation}</p>
                </div>

            </div>

            {/* =================================
                INCOME ALLOCATION
            ================================= */}

            <section
                className="budget-allocation"
                aria-label="Income allocation"
            >

                <div className="budget-allocation-header">

                    <div>
                        <h4>Income Allocation</h4>

                        <p>
                            How your recorded income is distributed
                        </p>
                    </div>

                    <span className="budget-allocation-period">
                        Financial Overview
                    </span>

                </div>

                {hasAllocationData ? (
                    <>

                        {/* Allocation progress bar */}

                        <div
                            className="budget-allocation-bar"
                            role="img"
                            aria-label={
                                `Expenses ${expensePercentage.toFixed(1)} percent, ` +
                                `retained income ${retainedPercentage.toFixed(1)} percent`
                            }
                        >

                            <div
                                className="budget-allocation-expense"
                                style={{
                                    width: `${expensePercentage}%`,
                                }}
                            />

                            <div
                                className="budget-allocation-retained"
                                style={{
                                    width: `${retainedPercentage}%`,
                                }}
                            />

                        </div>

                        {/* Allocation breakdown */}

                        <div className="budget-allocation-legend">

                            <div className="budget-allocation-item">

                                <span className="budget-allocation-dot expense-dot" />

                                <div>
                                    <span>
                                        Recorded Expenses
                                    </span>

                                    <strong>
                                        {formatCurrency(numericExpense)}
                                    </strong>

                                    <small>
                                        {expensePercentage.toFixed(1)}% of income
                                    </small>
                                </div>

                            </div>

                            <div className="budget-allocation-item">

                                <span className="budget-allocation-dot retained-dot" />

                                <div>
                                    <span>
                                        Retained Income
                                    </span>

                                    <strong>
                                        {formatCurrency(retainedIncome)}
                                    </strong>

                                    <small>
                                        {retainedPercentage.toFixed(1)}% of income
                                    </small>
                                </div>

                            </div>

                        </div>

                    </>
                ) : (
                    <p className="budget-allocation-empty">
                        {allocationMessage}
                    </p>
                )}

                {hasAllocationData && (
                    <p className="budget-allocation-note">
                        {allocationMessage}
                    </p>
                )}

            </section>

        </div>
    );
}

export default BudgetHealth;
