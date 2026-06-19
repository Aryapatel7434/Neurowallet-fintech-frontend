function TransferActivity({
  transactions = []
}) {

  const transfers = transactions.filter(
    tx => tx.type === "TRANSFER"
  );

  console.log("TRANSFERS:", transfers);

  const latestTransfer =
    transfers.length > 0
      ? transfers[0]
      : null;
console.log("LATEST TRANSFER:", latestTransfer);
  return (
    <div className="wallet-card">

      <h2>Transfer Activity</h2>

      {latestTransfer ? (
        <>
          <p>
            <strong>Latest Transfer:</strong>
            {" "}₹{latestTransfer.amount}
          </p>

          <p>
            <strong>Date:</strong>
            {" "}
            {new Date(
              latestTransfer.createdAt
            ).toLocaleString()}
          </p>
        </>
      ) : (
        <p>No transfers yet</p>
      )}

    </div>
  );
}

export default TransferActivity;