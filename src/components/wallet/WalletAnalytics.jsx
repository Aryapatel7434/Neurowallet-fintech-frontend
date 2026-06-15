function WalletAnalytics({

  transactions,

  wallet

}) {

  const totalCredit =
    transactions
      .filter(
        tx =>
          tx.type ===
          "CREDIT"
      )
      .reduce(
        (sum, tx) =>
          sum +
          Number(
            tx.amount
          ),
        0
      );

  const totalDebit =
    transactions
      .filter(
        tx =>
          tx.type ===
          "DEBIT"
      )
      .reduce(
        (sum, tx) =>
          sum +
          Number(
            tx.amount
          ),
        0
      );

  return (

    <div className="analytics-grid">

      <div className="analytics-card">

        <h3>
          Total Credit
        </h3>

        <h2>
          ₹{totalCredit}
        </h2>

      </div>

      <div className="analytics-card">

        <h3>
          Total Debit
        </h3>

        <h2>
          ₹{totalDebit}
        </h2>

      </div>

      <div className="analytics-card">

        <h3>
          Transactions
        </h3>

        <h2>
          {transactions.length}
        </h2>

      </div>

      <div className="analytics-card">

        <h3>
          Wallet Status
        </h3>

        <h2>
          {wallet.status}
        </h2>

      </div>

    </div>

  );
}

export default WalletAnalytics;