import "./ActivityTimeline.css";

function ActivityTimeline({
    transactions = []
}) {

    console.log("Activity Timeline");
    console.log(transactions);

    const user =
        JSON.parse(localStorage.getItem("user"));

    const recentTransactions =
        [...transactions]
            .sort(
                (a, b) =>
                    new Date(b.timestamp) -
                    new Date(a.timestamp)
            )
            .slice(0, 5);

    const formatAmount = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    const formatDate = (timestamp) =>
        new Date(timestamp).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
const getRelativeTime = (timestamp) => {

    const now = new Date();

    const date = new Date(timestamp);

    const diff =
        Math.floor((now - date) / 1000);

    if (diff < 60)
        return "Just now";

    if (diff < 3600)
        return `${Math.floor(diff / 60)} min ago`;

    if (diff < 86400)
        return `${Math.floor(diff / 3600)} hrs ago`;

    if (diff < 172800)
        return "Yesterday";

    if (diff < 604800)
        return `${Math.floor(diff / 86400)} days ago`;

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
        }
    );

};
    return (

        <div className="activity-card">

            <h3>Recent Activity</h3>

            {

                recentTransactions.length === 0 ? (

                    <div className="activity-empty">

                        No recent activity available.

                    </div>

                ) : (

                    <div className="activity-list">

                        {

                            recentTransactions.map((transaction) => {

                                const isSender =
                                    transaction.senderEmail === user.email;

                               let activityType = "";

if (transaction.status === "FAILED") {

    activityType = "Transfer Failed";

}
else if (isSender) {

    activityType = "Money Sent";

}
else {

    activityType = "Money Received";

}

                                const otherPerson =
                                    isSender
                                        ? transaction.receiverEmail
                                        : transaction.senderEmail;
                                   
                                        const displayName =
    otherPerson
        ?.split("@")[0]
        ?.replace(
            /\b\w/g,
            c => c.toUpperCase()
        );
                                return (

                                    <div
    className="activity-item"
    key={transaction.transactionId}
    style={{
        borderLeft:
            transaction.status === "FAILED"
                ? "4px solid #f59e0b"
                : isSender
                ? "4px solid #3b82f6"
                : "4px solid #22c55e"
    }}
>

                                        <div className="activity-left">

                                          <div
  className={`activity-avatar ${
    transaction.status === "FAILED"
        ? "failed"
        : isSender
        ? "sent"
        : "received"
}`}
>
   {
    otherPerson
        ?.split("@")[0]
        ?.substring(0, 2)
        .toUpperCase()
}
</div>

                                            <div>

                                               <div>

    <h4>
        {displayName}
    </h4>

    <p className="activity-type">
        {activityType}
    </p>

</div>
                                                <p className="activity-email">
    {otherPerson}
</p>

                                                <span>
                                                   {getRelativeTime(transaction.timestamp)}
                                                </span>
                                                <span>

    #{transaction.transactionId}

</span>

                                            </div>

                                        </div>

                                      <div className="activity-right">

   <strong
    className={
        isSender
            ? "expense"
            : "income"
    }
>

    {isSender ? "-" : "+"}

    {formatAmount(transaction.amount)}

</strong>
    <span
    className={`status ${transaction.status.toLowerCase()}`}
>
    {
        transaction.status === "SUCCESS"
            ? "✓ Success"
            : "✕ Failed"
    }
</span>

</div>
                                    </div>

                                );

                            })

                        }

                    </div>

                )

            }

        </div>

    );

}

export default ActivityTimeline;