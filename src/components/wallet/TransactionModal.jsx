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
            <strong>ID:</strong>{" "}
            {transaction.id || transaction.transactionId}
          </p>

          <p>
            <strong>Category:</strong>{" "}
            {transaction.category || transaction.type}
          </p>

          <p>
            <strong>Amount:</strong>{" "}
            ₹{Number(
              transaction.amount || 0
            ).toLocaleString()}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {
              new Date(
                transaction.timestamp ||
                transaction.createdAt
              ).toLocaleString()
            }
          </p>

          {/* Transfer Transaction */}
          {transaction.senderEmail && (
            <p>
              <strong>Sender:</strong>{" "}
              {transaction.senderEmail}
            </p>
          )}

          {transaction.receiverEmail && (
            <p>
              <strong>Receiver:</strong>{" "}
              {transaction.receiverEmail}
            </p>
          )}

          {/* Wallet Transaction */}
          {transaction.wallet && (
            <p>
              <strong>Wallet ID:</strong>{" "}
              {transaction.wallet.walletId}
            </p>
          )}

          <p>
            <strong>Status:</strong>{" "}
            {transaction.status || "SUCCESS"}
          </p>

          <p>
            <strong>Reference:</strong>{" "}
            NW-
            {transaction.id ||
              transaction.transactionId}
          </p>

        </div>

      </div>

    </div>

  );

}

export default TransactionModal;