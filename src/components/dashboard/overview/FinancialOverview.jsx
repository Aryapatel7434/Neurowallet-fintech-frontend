import {
  FaWallet,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaPiggyBank,
} from "react-icons/fa6";

function FinancialOverview({
  wallet,
  transactions = [],
}) {

  const transactionList =
    Array.isArray(transactions)
      ? transactions
      : [];

      console.log(
  "FinancialOverview Transactions:",
  transactionList
);
  const balance =
    wallet?.balance || 0;

  const income =
    transactionList
      .filter(
        (t) => t.type === "CREDIT"
      )
      .reduce(
        (sum, t) =>
          sum + (t.amount || 0),
        0
      );

  const expense =
    transactionList
      .filter(
        (t) => t.type === "DEBIT"
      )
      .reduce(
        (sum, t) =>
          sum + (t.amount || 0),
        0
      );

  const savings =
    income - expense;

  const formatCurrency = (
    amount
  ) =>
    new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount);

     return (
  <div className="financial-overview">

    <div className="overview-card balance-card">

      <div className="overview-top">

        <div className="overview-icon-wrapper balance-bg">
          <FaWallet className="overview-icon" />
        </div>

        <span className="status-badge live">
          LIVE
        </span>

      </div>

      <h4>Live Balance</h4>

      <h2>
        {formatCurrency(balance)}
      </h2>

      <p className="overview-subtitle">
        Available Wallet Balance
      </p>

    </div>

    <div className="overview-card income-card">

      <div className="overview-top">

        <div className="overview-icon-wrapper income-bg">
          <FaArrowTrendUp className="overview-icon" />
        </div>

        <span className="status-badge success">
          + Income
        </span>

      </div>

      <h4>Monthly Income</h4>

      <h2>
        {formatCurrency(income)}
      </h2>

      <p className="overview-subtitle">
        Total Incoming Money
      </p>

    </div>

    <div className="overview-card expense-card">

      <div className="overview-top">

        <div className="overview-icon-wrapper expense-bg">
          <FaArrowTrendDown className="overview-icon" />
        </div>

        <span className="status-badge danger">
          Expense
        </span>

      </div>

      <h4>Monthly Expense</h4>

      <h2>
        {formatCurrency(expense)}
      </h2>

      <p className="overview-subtitle">
        Total Outgoing Money
      </p>

    </div>

    <div className="overview-card savings-card">

      <div className="overview-top">

        <div className="overview-icon-wrapper savings-bg">
          <FaPiggyBank className="overview-icon" />
        </div>

        <span className="status-badge savings">
          Saving
        </span>

      </div>

      <h4>Savings Rate</h4>

      <h2>
        {formatCurrency(savings)}
      </h2>

      <p className="overview-subtitle">
        Money Saved This Month
      </p>

    </div>

  </div>
);
}

export default FinancialOverview;