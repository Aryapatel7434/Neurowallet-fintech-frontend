import {
  FaWallet,
  FaChartLine,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

function ExecutiveStats({
  wallet,
  transactions,
}) {

  // Safe Array Handling
  const transactionList = Array.isArray(transactions)
    ? transactions
    : transactions?.content || [];

  const balance =
    wallet?.balance || 0;

  const totalTransactions =
    transactionList.length;

  const totalSent =
    transactionList
      .filter(
        (t) =>
          t.type === "DEBIT"
      )
      .reduce(
        (sum, t) =>
          sum + (t.amount || 0),
        0
      );

  const totalReceived =
    transactionList
      .filter(
        (t) =>
          t.type === "CREDIT"
      )
      .reduce(
        (sum, t) =>
          sum + (t.amount || 0),
        0
      );

  const formatCurrency = (
    amount
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  return (
    <div className="executive-stats">

      {/* Wallet Balance */}

      <div className="kpi-card primary">
        <div className="kpi-top">
          <FaWallet />
          <span>Wallet Balance</span>
        </div>

        <h2>
          {formatCurrency(balance)}
        </h2>

        <p>
          Current Available Balance
        </p>

        <div className="kpi-trend success">
          Live Data
        </div>
      </div>

      {/* Total Transactions */}

      <div className="kpi-card">
        <div className="kpi-top">
          <FaChartLine />
          <span>Transactions</span>
        </div>

        <h2>
          {totalTransactions}
        </h2>

        <p>
          Total Recorded Transactions
        </p>

        <div className="kpi-trend">
          Activity
        </div>
      </div>

      {/* Money Sent */}

      <div className="kpi-card">
        <div className="kpi-top">
          <FaArrowUp />
          <span>Money Sent</span>
        </div>

        <h2>
          {formatCurrency(totalSent)}
        </h2>

        <p>
          Total Debit Amount
        </p>

        <div className="kpi-trend danger">
          Outgoing
        </div>
      </div>

      {/* Money Received */}

      <div className="kpi-card">
        <div className="kpi-top">
          <FaArrowDown />
          <span>Money Received</span>
        </div>

        <h2>
          {formatCurrency(totalReceived)}
        </h2>

        <p>
          Total Credit Amount
        </p>

        <div className="kpi-trend success">
          Incoming
        </div>
      </div>

    </div>
  );
}

export default ExecutiveStats;