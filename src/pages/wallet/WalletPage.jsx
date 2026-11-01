
import { useCallback, useEffect, useState } from "react";
import {
  FaWallet,
  FaPlus,
  FaArrowDown,
  FaPaperPlane,
  FaRotateRight,
  FaEye,
  FaEyeSlash,
  FaClockRotateLeft,
  FaArrowRight,
} from "react-icons/fa6";
import { toast } from "react-toastify";

import "../../styles/wallet.css";

import WalletHeader from "../../components/wallet/WalletHeader";
import WalletAnalytics from "../../components/wallet/WalletAnalytics";
import TransferActivity from "../../components/wallet/TransferActivity";
import TransactionHistory from "../../components/wallet/TransactionHistory";
import TransactionDetailsDrawer from "../../components/wallet/TransactionDetailsDrawer";

import {
  getMyWallet,
  getTransactions,
  addMoney,
  withdrawMoney,
  getWalletSummary,
} from "../../services/walletService";

import { transferMoney } from "../../services/transferService";

import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import { CATEGORY_LABELS } from "../../constants/categoryLabels";

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

const validateAmount = (value) => {
  const amount = String(value ?? "").trim();

  if (!amount) return "Please enter an amount.";
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return "Enter a valid amount with up to two decimal places.";
  }
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return "Amount must be greater than zero.";
  }

  return null;
};

const getErrorMessage = (error, fallback) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error;

  return typeof message === "string" ? message : fallback;
};

function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [walletSummary, setWalletSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [category, setCategory] = useState("OTHER");

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const refreshWalletData = useCallback(async () => {
    try {
      const [walletData, transactionData, summaryData] =
        await Promise.all([
          getMyWallet(),
          getTransactions(),
          getWalletSummary(),
        ]);

      if (!walletData) {
        throw new Error("Wallet information is unavailable.");
      }

      setWallet(walletData);
      setTransactions(
        Array.isArray(transactionData) ? transactionData : []
      );
      setWalletSummary(summaryData || null);
      setLoadError("");

      return true;
    } catch (error) {
      console.error("Wallet refresh failed:", error);

      setLoadError(
        getErrorMessage(
          error,
          "Unable to retrieve wallet information."
        )
      );

      return false;
    }
  }, []);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    await refreshWalletData();
    setLoading(false);
  }, [refreshWalletData]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleRefresh = async () => {
    if (refreshing || actionLoading) return;

    setRefreshing(true);
    const success = await refreshWalletData();

    if (success) {
      toast.success("Wallet refreshed successfully.");
    } else {
      toast.error("Unable to refresh wallet.");
    }

    setRefreshing(false);
  };

  const refreshAfterTransaction = async () => {
    try {
      sessionStorage.setItem("dashboardRefresh", "true");
    } catch (error) {
      console.warn("Unable to update dashboard refresh signal:", error);
    }

    const refreshed = await refreshWalletData();

    if (!refreshed) {
      toast.warning(
        "Operation completed, but wallet data could not be refreshed."
      );
    }
  };

  const handleAddMoney = async (event) => {
    event.preventDefault();

    if (actionLoading) return;

    const validationError = validateAmount(addAmount);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const amount = Number(addAmount);

    try {
      setActionLoading("add");

      await addMoney(amount);
      setAddAmount("");

      await refreshAfterTransaction();

      toast.success(`${formatCurrency(amount)} added successfully.`);
    } catch (error) {
      console.error("Add money failed:", error);
      toast.error(getErrorMessage(error, "Unable to add money."));
    } finally {
      setActionLoading("");
    }
  };

  const handleWithdraw = async (event) => {
    event.preventDefault();

    if (actionLoading) return;

    const validationError = validateAmount(withdrawAmount);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const amount = Number(withdrawAmount);
    const balance = Number(wallet?.balance);

    if (Number.isFinite(balance) && amount > balance) {
      toast.error("Insufficient wallet balance.");
      return;
    }

    try {
      setActionLoading("withdraw");

      await withdrawMoney(amount);
      setWithdrawAmount("");

      await refreshAfterTransaction();

      toast.success(`${formatCurrency(amount)} withdrawn successfully.`);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error(getErrorMessage(error, "Unable to withdraw money."));
    } finally {
      setActionLoading("");
    }
  };

  const handleTransfer = async (event) => {
    event.preventDefault();

    if (actionLoading) return;

    const email = receiverEmail.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error("Enter a valid receiver email.");
      return;
    }

    const currentEmail = (
      localStorage.getItem("email") || ""
    ).trim().toLowerCase();

    if (currentEmail && email === currentEmail) {
      toast.error("You cannot transfer money to yourself.");
      return;
    }

    const validationError = validateAmount(transferAmount);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const amount = Number(transferAmount);
    const balance = Number(wallet?.balance);

    if (Number.isFinite(balance) && amount > balance) {
      toast.error("Insufficient wallet balance.");
      return;
    }

    try {
      setActionLoading("transfer");

      await transferMoney(email, amount, category);

      setReceiverEmail("");
      setTransferAmount("");
      setCategory("OTHER");

      await refreshAfterTransaction();

      toast.success("Transfer completed successfully.");
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error(
        getErrorMessage(error, "Unable to complete transfer.")
      );
    } finally {
      setActionLoading("");
    }
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <main className="wallet-page">
        <WalletHeader />
        <div className="wallet-loading">
          <div className="wallet-loading-spinner" />
          <h2>Loading wallet</h2>
          <p>Retrieving your wallet information securely...</p>
        </div>
      </main>
    );
  }

  if (!wallet && loadError) {
    return (
      <main className="wallet-page">
        <WalletHeader />

        <section className="wallet-error-panel">
          <FaWallet />
          <h2>Unable to load wallet</h2>
          <p>{loadError}</p>

          <button
            type="button"
            className="wallet-primary-btn"
            onClick={loadWallet}
          >
            <FaRotateRight />
            Retry
          </button>
        </section>
      </main>
    );
  }

  const walletStatus =
    walletSummary?.walletStatus || "Status unavailable";

  return (
    <main className="wallet-page wallet-page-v2">
      <WalletHeader />

      {/* PAGE TITLE */}
      <section className="wallet-page-heading">
        <div>
          <span className="wallet-page-eyebrow">
            DIGITAL WALLET
          </span>
          <h1>My Wallet</h1>
          <p>
            Manage your balance, move money and review wallet activity.
          </p>
        </div>

        <button
          type="button"
          className="wallet-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing || Boolean(actionLoading)}
        >
          <FaRotateRight className={refreshing ? "is-refreshing" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      {loadError && (
        <div className="wallet-inline-error" role="alert">
          {loadError}
        </div>
      )}

      {/* TOP OVERVIEW */}
      <section className="wallet-command-grid">
        <article className="wallet-balance-panel wallet-balance-panel-v2">
          <div className="wallet-balance-top">
            <div className="wallet-brand">
              <span className="wallet-brand-icon">
                <FaWallet />
              </span>
              <div>
                <span className="wallet-card-label">
                  AVAILABLE BALANCE
                </span>
                <h2>NeuroWallet</h2>
              </div>
            </div>

            <span className="wallet-active-status">
              <span />
              {walletStatus}
            </span>
          </div>

          <div className="wallet-balance-content">
            <span>Available Balance</span>

            <div className="wallet-balance-value-row">
              <h2>
                {balanceVisible
                  ? formatCurrency(wallet?.balance)
                  : "₹ ••••••••"}
              </h2>

              <button
                type="button"
                className="wallet-balance-visibility"
                onClick={() => setBalanceVisible((visible) => !visible)}
                aria-label={
                  balanceVisible ? "Hide balance" : "Show balance"
                }
              >
                {balanceVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="wallet-balance-footer">
            <span>Currency: INR</span>
            <span>
              {walletSummary?.lastUpdated
                ? `Updated ${new Date(
                    walletSummary.lastUpdated
                  ).toLocaleString("en-IN")}`
                : "Latest wallet balance"}
            </span>
          </div>
        </article>

        <article className="wallet-quick-actions">
          <div className="wallet-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Access your wallet operations</p>
            </div>
          </div>

          <div className="wallet-quick-actions-grid">
            <button
              type="button"
              className="wallet-quick-action add"
              onClick={() => scrollToSection("wallet-add-form")}
            >
              <span><FaPlus /></span>
              <strong>Add Money</strong>
              <small>Fund wallet</small>
            </button>

            <button
              type="button"
              className="wallet-quick-action withdraw"
              onClick={() => scrollToSection("wallet-withdraw-form")}
            >
              <span><FaArrowDown /></span>
              <strong>Withdraw</strong>
              <small>Move funds out</small>
            </button>

            <button
              type="button"
              className="wallet-quick-action transfer"
              onClick={() => scrollToSection("wallet-transfer-form")}
            >
              <span><FaPaperPlane /></span>
              <strong>Transfer</strong>
              <small>Send money</small>
            </button>

            <button
              type="button"
              className="wallet-quick-action history"
              onClick={() => scrollToSection("wallet-transaction-history")}
            >
              <span><FaClockRotateLeft /></span>
              <strong>History</strong>
              <small>View records</small>
            </button>
          </div>
        </article>
      </section>

      {/* WALLET ACTIVITY METRICS */}
      <section className="wallet-module-section wallet-activity-section">
        <div className="wallet-section-heading">
          <div>
            <h2>Wallet Activity</h2>
            <p>Your recorded credits, debits and transfers.</p>
          </div>
        </div>

        <WalletAnalytics summary={walletSummary} />
      </section>

      {/* MAIN WALLET WORKSPACE */}
      <section className="wallet-workspace-grid">
        <div className="wallet-workspace-main">
          {/* RECENT WALLET ACTIVITY */}
          <section className="wallet-module-section wallet-recent-section">
            <div className="wallet-section-heading">
              <div>
                <h2>Recent Wallet Activity</h2>
                <p>Your latest wallet movements.</p>
              </div>

              <button
                type="button"
                className="wallet-text-action"
                onClick={() =>
                  scrollToSection("wallet-transaction-history")
                }
              >
                View history <FaArrowRight />
              </button>
            </div>

            <TransferActivity transactions={transactions} />
          </section>

          {/* TRANSACTION HISTORY */}
          <section
            className="wallet-module-section"
            id="wallet-transaction-history"
          >
            <TransactionHistory
              transactions={transactions}
              onSelectTransaction={setSelectedTransaction}
            />
          </section>
        </div>

        {/* OPERATIONS SIDEBAR */}
        <aside className="wallet-operations-sidebar">
          <div className="wallet-section-heading">
            <div>
              <h2>Wallet Operations</h2>
              <p>Secure money movement</p>
            </div>
          </div>

          <form
            id="wallet-add-form"
            className="wallet-operation-card wallet-operation-card-v2 add"
            onSubmit={handleAddMoney}
          >
            <div className="wallet-operation-heading">
              <span className="wallet-operation-icon add">
                <FaPlus />
              </span>
              <div>
                <h3>Add Money</h3>
                <p>Fund your wallet.</p>
              </div>
            </div>

            <label htmlFor="wallet-add-amount">
              Amount (INR)
            </label>
            <input
              id="wallet-add-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(event) => setAddAmount(event.target.value)}
              disabled={Boolean(actionLoading)}
              required
            />

            <button
              type="submit"
              className="wallet-primary-btn"
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === "add" ? "Processing..." : "Add Money"}
              <FaArrowRight />
            </button>
          </form>

          <form
            id="wallet-withdraw-form"
            className="wallet-operation-card wallet-operation-card-v2 withdraw"
            onSubmit={handleWithdraw}
          >
            <div className="wallet-operation-heading">
              <span className="wallet-operation-icon withdraw">
                <FaArrowDown />
              </span>
              <div>
                <h3>Withdraw Money</h3>
                <p>Withdraw from your wallet.</p>
              </div>
            </div>

            <label htmlFor="wallet-withdraw-amount">
              Amount (INR)
            </label>
            <input
              id="wallet-withdraw-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(event) =>
                setWithdrawAmount(event.target.value)
              }
              disabled={Boolean(actionLoading)}
              required
            />

            <button
              type="submit"
              className="wallet-secondary-btn"
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === "withdraw"
                ? "Processing..."
                : "Withdraw Money"}
              <FaArrowRight />
            </button>
          </form>

          <form
            id="wallet-transfer-form"
            className="wallet-transfer-panel wallet-transfer-panel-v2"
            onSubmit={handleTransfer}
          >
            <div className="wallet-operation-heading">
              <span className="wallet-operation-icon transfer">
                <FaPaperPlane />
              </span>
              <div>
                <h3>Quick Transfer</h3>
                <p>Send money to another account.</p>
              </div>
            </div>

            <div className="wallet-form-field">
              <label htmlFor="wallet-receiver-email">
                Receiver Email
              </label>
              <input
                id="wallet-receiver-email"
                type="email"
                placeholder="receiver@example.com"
                value={receiverEmail}
                onChange={(event) =>
                  setReceiverEmail(event.target.value)
                }
                autoComplete="off"
                required
                disabled={Boolean(actionLoading)}
              />
            </div>

            <div className="wallet-form-field">
              <label htmlFor="wallet-transfer-amount">
                Amount (INR)
              </label>
              <input
                id="wallet-transfer-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                placeholder="Enter amount"
                value={transferAmount}
                onChange={(event) =>
                  setTransferAmount(event.target.value)
                }
                required
                disabled={Boolean(actionLoading)}
              />
            </div>

            <div className="wallet-form-field">
              <label htmlFor="wallet-transfer-category">
                Transaction Category
              </label>
              <select
                id="wallet-transfer-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={Boolean(actionLoading)}
              >
                {TRANSACTION_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {CATEGORY_LABELS[item] || item}
                  </option>
                ))}
              </select>
            </div>

            <p className="wallet-transfer-note">
              Verify receiver details before submitting.
            </p>

            <button
              type="submit"
              className="wallet-primary-btn"
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === "transfer"
                ? "Processing Transfer..."
                : "Transfer Money"}
              <FaPaperPlane />
            </button>
          </form>

          {/* BACKEND SUMMARY — NO FABRICATED MONTHLY TOTALS */}
          <article className="wallet-mini-summary">
            <div className="wallet-section-heading">
              <div>
                <h3>Wallet Summary</h3>
                <p>Recorded account totals</p>
              </div>
            </div>

            <div className="wallet-mini-summary-row">
              <span>Total Credit</span>
              <strong>
                {formatCurrency(walletSummary?.totalCredit)}
              </strong>
            </div>

            <div className="wallet-mini-summary-row">
              <span>Total Debit</span>
              <strong>
                {formatCurrency(walletSummary?.totalDebit)}
              </strong>
            </div>

            <div className="wallet-mini-summary-row">
              <span>Transfer Volume</span>
              <strong>
                {formatCurrency(walletSummary?.totalTransfer)}
              </strong>
            </div>

            <div className="wallet-mini-summary-row">
              <span>Total Transactions</span>
              <strong>
                {Number(walletSummary?.totalTransactions ?? 0)}
              </strong>
            </div>
          </article>
        </aside>
      </section>

      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        open={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
      />
    </main>
  );
}

export default WalletPage;
