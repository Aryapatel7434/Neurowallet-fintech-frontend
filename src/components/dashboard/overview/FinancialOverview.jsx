
import {
  FaWallet,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaPiggyBank,
} from "react-icons/fa6";

import "./FinancialOverview.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

function readNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatCurrency(value) {
  if (value === null) return "—";

  if (Math.abs(value) >= 100000) {
    return `₹${compactCurrencyFormatter.format(value)}`;
  }

  return currencyFormatter.format(value);
}

function FinancialOverview({ wallet, dashboardInsights }) {
  const balance = readNumber(wallet?.balance);
  const totalIncome = readNumber(dashboardInsights?.totalIncome);
  const totalExpense = readNumber(dashboardInsights?.totalExpense);

  const suppliedNetCashFlow = readNumber(
    dashboardInsights?.netCashFlow
  );

  const netCashFlow =
    suppliedNetCashFlow !== null
      ? suppliedNetCashFlow
      : totalIncome !== null && totalExpense !== null
        ? totalIncome - totalExpense
        : null;

  const savingsRate =
    totalIncome !== null &&
    totalIncome > 0 &&
    netCashFlow !== null
      ? (netCashFlow / totalIncome) * 100
      : null;

  const cards = [
    {
      key: "balance",
      label: "Total Balance",
      value: formatCurrency(balance),
      detail:
        balance === null
          ? "Wallet balance unavailable"
          : "Available wallet balance",
      icon: <FaWallet aria-hidden="true" />,
      iconClass: "nw-kpi-icon--balance",
      tone: "neutral",
      statusIcon: <FaWallet aria-hidden="true" />,
    },
    {
      key: "income",
      label: "Total Income",
      value: formatCurrency(totalIncome),
      detail:
        totalIncome === null
          ? "Income data unavailable"
          : "Income recorded for the current period",
      icon: <FaArrowTrendUp aria-hidden="true" />,
      iconClass: "nw-kpi-icon--income",
      tone: "positive",
      statusIcon: <FaArrowTrendUp aria-hidden="true" />,
    },
    {
      key: "expenses",
      label: "Total Expenses",
      value: formatCurrency(totalExpense),
      detail:
        totalExpense === null
          ? "Expense data unavailable"
          : "Expenses recorded for the current period",
      icon: <FaArrowTrendDown aria-hidden="true" />,
      iconClass: "nw-kpi-icon--expenses",
      tone: "negative",
      statusIcon: <FaArrowTrendDown aria-hidden="true" />,
    },
    {
      key: "savings-rate",
      label: "Savings Rate",
      value:
        savingsRate === null
          ? "—"
          : `${savingsRate.toFixed(1)}%`,
      detail:
        savingsRate === null
          ? "Requires income and expense data"
          : netCashFlow >= 0
            ? "Income retained after expenses"
            : "Expenses exceed income",
      icon: <FaPiggyBank aria-hidden="true" />,
      iconClass: "nw-kpi-icon--savings",
      tone:
        savingsRate === null
          ? "neutral"
          : netCashFlow >= 0
            ? "positive"
            : "negative",
      statusIcon:
        netCashFlow !== null && netCashFlow < 0
          ? <FaArrowTrendDown aria-hidden="true" />
          : <FaPiggyBank aria-hidden="true" />,
    },
  ];

  return (
    <section
      className="nw-financial-overview"
      aria-label="Financial overview"
    >
      {cards.map((card) => (
        <article
          className="nw-financial-kpi"
          key={card.key}
        >
          <div className="nw-financial-kpi__main">
            <span
              className={`nw-kpi-icon ${card.iconClass}`}
              aria-hidden="true"
            >
              {card.icon}
            </span>

            <div className="nw-financial-kpi__content">
              <p className="nw-financial-kpi__label">
                {card.label}
              </p>

              <p
                className={`nw-financial-kpi__value nw-financial-kpi__value--${card.tone}`}
                title={card.value}
              >
                {card.value}
              </p>
            </div>
          </div>

          <div className="nw-financial-kpi__footer">
            <span
              className={`nw-kpi-status nw-kpi-status--${card.tone}`}
              aria-hidden="true"
            >
              {card.statusIcon}
            </span>

            <p>{card.detail}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default FinancialOverview;
