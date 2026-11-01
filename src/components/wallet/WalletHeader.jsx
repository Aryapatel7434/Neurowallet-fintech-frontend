
import { useMemo } from "react";
import { FaWallet } from "react-icons/fa6";
import NotificationBell from "./NotificationBell";

function WalletHeader() {

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";

        return "Good evening";
    }, []);

    return (
        <header className="wallet-top-header">

            <div className="wallet-top-header-content">

                <div className="wallet-top-header-icon">
                    <FaWallet />
                </div>

                <div className="wallet-top-header-text">

                    <span className="wallet-top-eyebrow">
                        {greeting}
                    </span>

                    <h2>Welcome to NeuroWallet</h2>

                    <p>
                        Your wallet and financial activity, in one place.
                    </p>

                </div>

            </div>

            <div className="wallet-top-header-actions">
                <NotificationBell />
            </div>

        </header>
    );
}

export default WalletHeader;
