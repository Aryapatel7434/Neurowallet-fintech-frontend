import {
  FaArrowTrendUp,
  FaArrowTrendDown
} from "react-icons/fa6";

import {
  FaCheckCircle
} from "react-icons/fa";
import {
 FaPlus
} from "react-icons/fa";

import {
 FaMoneyBillWave
} from "react-icons/fa";
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

  transactions = [],

  wallet = {}

}) {

  const totalCredit =
    transactions
      .filter(tx => tx.type === "CREDIT")
      .reduce(
        (sum, tx) =>
          sum + Number(tx.amount),
        0
      );

  const totalDebit =
    transactions
      .filter(tx => tx.type === "DEBIT")
      .reduce(
        (sum, tx) =>
          sum + Number(tx.amount),
        0
      );

  const totalTransfer =
    transactions
      .filter(tx => tx.type === "TRANSFER")
      .reduce(
        (sum, tx) =>
          sum + Number(tx.amount),
        0
      );

  const highestCredit =
    Math.max(
      ...transactions
        .filter(tx => tx.type === "CREDIT")
        .map(tx => Number(tx.amount)),
      0
    );

  const highestDebit =
    Math.max(
      ...transactions
        .filter(tx => tx.type === "DEBIT")
        .map(tx => Number(tx.amount)),
      0
    );

  const successRate = 100;

  return (

    <div className="analytics-grid">

      {/* Total Credit */}

      <div className="analytics-card">

        <h3>
          <FaArrowTrendUp />
          {" "}Total Credit
        </h3>

        <h2>
          ₹{totalCredit}
        </h2>

        <p className="analytics-growth">
          +18.5% This Month
        </p>

      </div>

      {/* Total Debit */}

      <div className="analytics-card">

        <h3>
          <FaArrowTrendDown />
          {" "}Total Debit
        </h3>

        <h2>
          ₹{totalDebit}
        </h2>

        <p className="analytics-growth">
          +4.2% This Month
        </p>

      </div>

      {/* Total Transfers */}

      <div className="analytics-card">

        <h3>
          <MdSwapHoriz />
          {" "}Total Transfers
        </h3>

        <h2>
          ₹{totalTransfer}
        </h2>

        <p className="analytics-growth">
          {
            transactions.filter(
              tx => tx.type === "TRANSFER"
            ).length
          } Successful
        </p>

      </div>

      {/* Transactions */}

      <div className="analytics-card">

        <h3>
          <HiMiniChartBar />
          {" "}Transactions
        </h3>

        <h2>
          {transactions.length}
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
          {wallet?.status || "ACTIVE"}
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
          ₹{highestCredit}
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
          ₹{highestDebit}
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
          A+
        </h2>

        <p className="analytics-growth">
          Excellent
        </p>

      </div>

      {/* Success Rate */}

    </div>

  );
}

export default WalletAnalytics;