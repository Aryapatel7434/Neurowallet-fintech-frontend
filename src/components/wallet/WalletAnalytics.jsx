import {
  FaArrowTrendUp,
  FaArrowTrendDown
} from "react-icons/fa6";

import {
  MdSwapHoriz
} from "react-icons/md";

import {
  HiMiniChartBar
} from "react-icons/hi2";

import {
  FaWallet
} from "react-icons/fa";

function WalletAnalytics({

  wallet = {},

  summary = {}

}) {

  // ==============================
  // Backend Summary Data
  // ==============================

  const totalCredit =
    summary?.totalCredit ?? 0;

  const totalDebit =
    summary?.totalDebit ?? 0;

  const totalTransfer =
    summary?.totalTransfer ?? 0;

  const successfulTransfers =
    summary?.successfulTransfers ?? 0;

  const highestCredit =
    summary?.highestCredit ?? 0;

  const highestDebit =
    summary?.highestDebit ?? 0;

  const totalTransactions =
    summary?.totalTransactions ?? 0;

  const walletStatus =
    summary?.walletStatus ?? "ACTIVE";

  const financialHealth =
    summary?.financialHealth ?? "Good";

  // ==============================
  // Currency Formatter
  // ==============================

  const formatCurrency = (amount) => {

    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2
      }
    );

  };
const formatCompactCurrency = (amount) => {

  return new Intl.NumberFormat(
    "en-IN",
    {
      notation: "compact",
      maximumFractionDigits: 2
    }
  ).format(Number(amount || 0));

};
  return (

    <div className="analytics-grid">

      {/* Total Credit */}

      <div className="analytics-card">

        <h3>
          <FaArrowTrendUp />
          {" "}Total Credit
        </h3>

        <h2>
          <h2 title={`₹${formatCurrency(totalCredit)}`}>
  ₹{formatCompactCurrency(totalCredit)}
</h2>
        </h2>

        <p className="analytics-growth">
          Lifetime Credits
        </p>

      </div>

      {/* Total Debit */}

      <div className="analytics-card">

        <h3>
          <FaArrowTrendDown />
          {" "}Total Debit
        </h3>

        <h2>
         <h2 title={`₹${formatCurrency(totalDebit)}`}>
  ₹{formatCompactCurrency(totalDebit)}
</h2>
        </h2>

        <p className="analytics-growth">
          Lifetime Debits
        </p>

      </div>

      {/* Total Transfers */}

      <div className="analytics-card">

        <h3>
          <MdSwapHoriz />
          {" "}Total Transfers
        </h3>

        <h2>
         <h2 title={`₹${formatCurrency(totalTransfer)}`}>
  ₹{formatCompactCurrency(totalTransfer)}
</h2>
        </h2>

        <p className="analytics-growth">
          {successfulTransfers} Successful
        </p>

      </div>

      {/* Total Transactions */}

      <div className="analytics-card">

        <h3>
          <HiMiniChartBar />
          {" "}Transactions
        </h3>

        <h2>
          {totalTransactions}
        </h2>

        <p className="analytics-growth">
          All Recorded
        </p>

      </div>

      {/* Wallet Status */}

      <div className="analytics-card">

        <h3>
          <FaWallet />
          {" "}Wallet Status
        </h3>

        <h2>
          {walletStatus}
        </h2>

        <p className="analytics-growth">
          Account Healthy
        </p>

      </div>

      {/* Highest Credit */}

      <div className="analytics-card">

        <h3>
          <FaArrowTrendUp />
          {" "}Highest Credit
        </h3>

        <h2>
          <h2 title={`₹${formatCurrency(highestCredit)}`}>
  ₹{formatCompactCurrency(highestCredit)}
</h2>
        </h2>

        <p className="analytics-growth">
          Best Deposit
        </p>

      </div>

      {/* Highest Debit */}

      <div className="analytics-card">

        <h3>
          <FaArrowTrendDown />
          {" "}Highest Debit
        </h3>

        <h2>
          <h2 title={`₹${formatCurrency(highestDebit)}`}>
  ₹{formatCompactCurrency(highestDebit)}
</h2>
        </h2>

        <p className="analytics-growth">
          Largest Expense
        </p>

      </div>

      {/* Financial Health */}

      <div className="analytics-card">

        <h3>
          <FaWallet />
          {" "}Financial Health
        </h3>

        <h2>
          {financialHealth}
        </h2>

        <p className="analytics-growth">
          AI Calculated
        </p>

      </div>

    </div>

  );

}

export default WalletAnalytics;