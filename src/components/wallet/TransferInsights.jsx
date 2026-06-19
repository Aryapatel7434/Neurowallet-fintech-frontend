function TransferInsights({

  transactions

}) {
  const safeTransactions =
  Array.isArray(transactions)
    ? transactions
    : [];

const transfers =
  safeTransactions.filter(
    tx => tx.type === "TRANSFER"
  );
  const transferCount =
    transfers.length;

  const totalTransfer =
    transfers.reduce(
      (sum, tx) =>
        sum +
        Number(tx.amount),
      0
    );

  const averageTransfer =
    transferCount > 0
      ? Math.round(
          totalTransfer /
          transferCount
        )
      : 0;

  const largestTransfer =
    transferCount > 0
      ? Math.max(
          ...transfers.map(
            tx =>
              Number(
                tx.amount
              )
          )
        )
      : 0;
  const transferSuccessRate =
  transferCount > 0
    ? 100
    : 0;
console.log(
  "TransferInsights:",
  transactions
);
  return (

    <div
      className="analytics-grid"
    >

      <div
        className="analytics-card"
      >
        <h3>
          Transfer Count
        </h3>

        <h2>
          {transferCount}
        </h2>
      </div>

      <div
        className="analytics-card"
      >
        <h3>
          Average Transfer
        </h3>

        <h2>
          ₹{averageTransfer}
        </h2>
      </div>

      <div
        className="analytics-card"
      >
        <h3>
          Largest Transfer
        </h3>

        <h2>
          ₹{largestTransfer}
        </h2>
      </div>
      <div
  className="analytics-card"
>
  <h3>
    Success Rate
  </h3>

  <h2>
    {transferSuccessRate}%
  </h2>
</div>

    </div>

  );
}

export default TransferInsights;