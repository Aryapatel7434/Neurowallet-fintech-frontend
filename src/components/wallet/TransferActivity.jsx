
import { useMemo } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaArrowsLeftRight,
  FaClock,
  FaReceipt,
} from "react-icons/fa6";

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getTransactionDate = (transaction) => {
  const value =
    transaction?.timestamp ??
    transaction?.createdAt ??
    transaction?.transactionDate ??
    transaction?.date;

  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatus = (status) => {
  const normalized = String(status ?? "UNKNOWN").toUpperCase();

  if (["SUCCESS", "SUCCESSFUL", "COMPLETED"].includes(normalized)) {
    return { label: "Success", className: "success" };
  }

  if (["PENDING", "PROCESSING", "IN_PROGRESS"].includes(normalized)) {
    return { label: "Pending", className: "pending" };
  }

  if (["FAILED", "FAILURE", "REJECTED"].includes(normalized)) {
    return { label: "Failed", className: "failed" };
  }

  return { label: normalized, className: "unknown" };
};

const getReference = (transaction) =>
  transaction?.transactionId ??
  transaction?.referenceId ??
  transaction?.id ??
  "Reference unavailable";

const getTransactionType = (transaction) => {
  const type = String(transaction?.type ?? "").toUpperCase();
  const category = String(transaction?.category ?? "").toUpperCase();

  if (type === "TRANSFER" || category === "TRANSFER") {
    return {
      label: "Transfer",
      icon: FaArrowsLeftRight,
      className: "transfer",
    };
  }

  if (type === "CREDIT") {
    return {
      label: "Credit",
      icon: FaArrowDown,
      className: "credit",
    };
  }

  if (type === "DEBIT") {
    return {
      label: "Debit",
      icon: FaArrowUp,
      className: "debit",
    };
  }

  return {
    label: type || "Transaction",
    icon: FaReceipt,
    className: "neutral",
  };
};

function TransferActivity({ transactions = [] }) {
  const recentTransfers = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    return transactions
      .filter((transaction) => {
        const type = String(transaction?.type ?? "").toUpperCase();
        const category = String(transaction?.category ?? "").toUpperCase();

        return type === "TRANSFER" || category === "TRANSFER";
      })
      .sort((a, b) => {
        const dateA = getTransactionDate(a)?.getTime() ?? 0;
        const dateB = getTransactionDate(b)?.getTime() ?? 0;

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [transactions]);

  return (
    <article className="wallet-transfer-activity-card">
      <div className="wallet-transfer-activity-header">
        <div className="wallet-activity-title-group">
          <span className="wallet-activity-heading-icon">
            <FaArrowsLeftRight />
          </span>

          <div>
            <h3>Recent Transfers</h3>
            <p>Your latest recorded wallet transfers</p>
          </div>
        </div>

        <span className="wallet-activity-count">
          {recentTransfers.length} records
        </span>
      </div>

      {recentTransfers.length === 0 ? (
        <div className="wallet-activity-empty">
          <span className="wallet-activity-empty-icon">
            <FaReceipt />
          </span>

          <h4>No transfer activity yet</h4>

          <p>
            Your wallet transfers will appear here after transactions
            are recorded.
          </p>
        </div>
      ) : (
        <div className="wallet-transfer-list">
          {recentTransfers.map((transaction, index) => {
            const type = getTransactionType(transaction);
            const status = getStatus(transaction?.status);
            const Icon = type.icon;
            const date = getTransactionDate(transaction);

            return (
              <div
                className="wallet-transfer-item"
                key={
                  transaction?.transactionId ??
                  transaction?.referenceId ??
                  transaction?.id ??
                  `${date?.getTime() ?? "unknown"}-${index}`
                }
              >
                <span
                  className={`wallet-transfer-item-icon ${type.className}`}
                >
                  <Icon />
                </span>

                <div className="wallet-transfer-item-details">
                  <div className="wallet-transfer-item-title">
                    <strong>{type.label}</strong>

                    <span
                      className={`wallet-activity-status ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <span className="wallet-transfer-reference">
                    Ref: {getReference(transaction)}
                  </span>

                  <span className="wallet-transfer-date">
                    <FaClock />
                    {formatDate(date)}
                  </span>
                </div>

                <div className="wallet-transfer-item-amount">
                  <strong>
                    {formatCurrency(transaction?.amount)}
                  </strong>

                  <span>
                    {transaction?.category || "Uncategorized"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default TransferActivity;
