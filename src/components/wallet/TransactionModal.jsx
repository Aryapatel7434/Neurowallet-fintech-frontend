import "../../styles/transactionModal.css";

function TransactionModal({
  transaction,
  onClose
}) {
   
    console.log(
  "SELECTED TX:",
  transaction
);

  if (!transaction) {
    return null;
  }

  return (

    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="transaction-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-header">

          <h2>
            Transaction Details
          </h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className="modal-body">

          <p>
  <strong>ID:</strong>
  {" "}
  {transaction.id}
</p>

<p>
  <strong>Type:</strong>
  {" "}
  {transaction.type}
</p>

<p>
  <strong>Amount:</strong>
  {" "}
   ₹{
  Number(
    transaction.amount
  )}
</p>

<p>
  <strong>Date:</strong>
  {" "}
  {new Date(
    transaction.createdAt
  ).toLocaleString()}
</p>

<p>
  <strong>Wallet ID:</strong>
  {" "}
  {transaction.wallet?.walletId}
</p>

<p>
  <strong>Status:</strong>
  {" "}
  SUCCESS
</p>

<p>
  <strong>Reference:</strong>
  {" "}
  NW-{transaction.id}
</p>
        </div>

      </div>

    </div>

  );
}

export default TransactionModal;