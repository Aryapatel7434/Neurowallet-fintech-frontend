import React from "react";

import { useNetworkStatus }
    from "../../hooks/useNetworkStatus";

import "./NetworkStatusBanner.css";

const NetworkStatusBanner = () => {

    const isOnline =
        useNetworkStatus();

    if (isOnline) {
        return null;
    }

    return (
        <div
            className="network-status-banner"
            role="alert"
            aria-live="assertive"
        >
            <span className="network-status-icon">
                ⚠
            </span>

            <span>
                You are offline. Check your internet connection.
            </span>
        </div>
    );
};

export default NetworkStatusBanner;