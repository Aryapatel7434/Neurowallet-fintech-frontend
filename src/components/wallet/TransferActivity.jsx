function TransferActivity({ transactions = [] }) {

   const transfers =
    transactions.filter(
        tx => tx.category === "TRANSFER"
    );
    console.log("TRANSFERS:", transfers);

    const latestTransfer =
        transfers.length > 0
            ? transfers[0]
            : null;

    return (

        <div className="wallet-card">

            <h2>Transfer Activity</h2>

            {latestTransfer ? (

                <>
                    <p>
                        <strong>Latest Transfer:</strong>
                        {" "}
                        ₹{latestTransfer.amount}
                    </p>

                    <p>
                        <strong>Receiver:</strong>
                        {" "}
                        {latestTransfer.receiverEmail}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        {" "}
                        {new Date(
                            latestTransfer.timestamp
                        ).toLocaleString()}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        {" "}
                        {latestTransfer.status}
                    </p>
                </>

            ) : (

                <p>No transfers yet</p>

            )}

        </div>

    );

}

export default TransferActivity;