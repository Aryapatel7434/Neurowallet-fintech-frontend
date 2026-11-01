
import {
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaArrowsLeftRight,
  FaReceipt,
} from "react-icons/fa6";

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

function MetricCard({ icon: Icon, label, value, description, variant }) {
  return (
    <article className={`wallet-kpi-card ${variant}`}>
      <div className="wallet-kpi-top">
        <span className="wallet-kpi-icon">
          <Icon />
        </span>
        <span className="wallet-kpi-label">{label}</span>
      </div>

      <h3 className="wallet-kpi-value">{value}</h3>
      <p className="wallet-kpi-description">{description}</p>
    </article>
  );
}

function WalletAnalytics({ summary = {} }) {
  const metrics = [
    {
      label: "Total Credit",
      value: formatCurrency(summary.totalCredit),
      description: "Money credited to your wallet",
      icon: FaArrowTrendUp,
      variant: "accent-credit",
    },
    {
      label: "Total Debit",
      value: formatCurrency(summary.totalDebit),
      description: "Money debited from your wallet",
      icon: FaArrowTrendDown,
      variant: "accent-debit",
    },
    {
      label: "Transfer Volume",
      value: formatCurrency(summary.totalTransfer),
      description: "Recorded transfer volume",
      icon: FaArrowsLeftRight,
      variant: "accent-transfer",
    },
    {
      label: "Transactions",
      value: Number(summary.totalTransactions ?? 0).toLocaleString("en-IN"),
      description: "Recorded wallet transactions",
      icon: FaReceipt,
      variant: "accent-neutral",
    },
  ];

  return (
    <div className="wallet-kpi-grid">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}

export default WalletAnalytics;
