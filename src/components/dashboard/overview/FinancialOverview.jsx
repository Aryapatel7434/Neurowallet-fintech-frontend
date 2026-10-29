import { FaWallet, FaArrowTrendUp, FaArrowTrendDown, FaPiggyBank } from "react-icons/fa6";
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

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  if (Math.abs(amount) >= 100000) {
    return `₹${compactCurrencyFormatter.format(amount)}`;
  }
  return currencyFormatter.format(amount);
}

function readNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function FinancialOverview({ wallet, dashboardInsights }) {
  const balance = readNumber(wallet?.balance);
  const totalIncome = readNumber(dashboardInsights?.totalIncome);
  const totalExpense = readNumber(dashboardInsights?.totalExpense);
  const netCashFlow = dashboardInsights?.netCashFlow == null
    ? totalIncome - totalExpense
    : readNumber(dashboardInsights.netCashFlow);

  // Derived from current-period backend totals; no fabricated month-over-month trend.
  const savingsRate = totalIncome > 0
    ? Math.max(-100, Math.min(100, (netCashFlow / totalIncome) * 100))
    : 0;

  const cards = [
    {
      key: "balance",
      label: "Total Balance",
      value: formatCurrency(balance),
      detail: balance > 0 ? "Available wallet balance" : "Your wallet is currently empty",
      icon: <FaWallet aria-hidden="true" />,
      iconClass: "nw-kpi-icon--balance",
      tone: "neutral",
    },
    {
      key: "income",
      label: "Total Income",
      value: formatCurrency(totalIncome),
      detail: "Income recorded for the current period",
      icon: <FaArrowTrendUp aria-hidden="true" />,
      iconClass: "nw-kpi-icon--income",
      tone: "positive",
    },
    {
      key: "expenses",
      label: "Total Expenses",
      value: formatCurrency(totalExpense),
      detail: "Expenses recorded for the current period",
      icon: <FaArrowTrendDown aria-hidden="true" />,
      iconClass: "nw-kpi-icon--expenses",
      tone: "negative",
    },
    {
      key: "savings-rate",
      label: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      detail: totalIncome > 0
        ? (netCashFlow >= 0 ? "Income retained after expenses" : "Expenses exceed income")
        : "Add income to calculate your rate",
      icon: <FaPiggyBank aria-hidden="true" />,
      iconClass: "nw-kpi-icon--savings",
      tone: netCashFlow >= 0 ? "positive" : "negative",
    },
  ];

  return (
    <section className="nw-financial-overview" aria-label="Financial overview">
      {cards.map((card) => (
        <article className="nw-financial-kpi" key={card.key}>
          <div className="nw-financial-kpi__main">
            <span className={`nw-kpi-icon ${card.iconClass}`}>{card.icon}</span>
            <div className="nw-financial-kpi__content">
              <p className="nw-financial-kpi__label">{card.label}</p>
              <p className={`nw-financial-kpi__value nw-financial-kpi__value--${card.tone}`} title={card.value}>
                {card.value}
              </p>
            </div>
          </div>
          <div className="nw-financial-kpi__footer">
            <span className={`nw-kpi-status nw-kpi-status--${card.tone}`} aria-hidden="true">
              {card.tone === "positive" ? <FaArrowTrendUp /> : card.tone === "negative" ? <FaArrowTrendDown /> : <FaWallet />}
            </span>
            <p>{card.detail}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default FinancialOverview;
