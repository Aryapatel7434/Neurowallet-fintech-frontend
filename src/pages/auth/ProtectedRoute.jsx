
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

function ProtectedRoute({
    children,
    allowedRoles,
}) {
    const {
        user,
        isAuthenticated,
        isInitializing,
        sessionRestoreError,
        retrySessionRestore,
    } = useContext(AuthContext);

    const location = useLocation();

    if (isInitializing) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="auth-loading"
            >
                Restoring your session...
            </div>
        );
    }

    // A temporary network/server error should not automatically
    // force the user to log in again.
    if (sessionRestoreError) {
        return (
            <main
                role="alert"
                className="auth-session-error"
                style={{
                    maxWidth: "480px",
                    margin: "80px auto",
                    padding: "24px",
                    textAlign: "center",
                }}
            >
                <h2>Unable to restore your session</h2>

                <p>
                    NeuroWallet could not connect to the
                    authentication service. Check your connection
                    and try again.
                </p>

                <button
                    type="button"
                    onClick={retrySessionRestore}
                >
                    Retry
                </button>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/"
                replace
                state={{ from: location }}
            />
        );
    }

    if (allowedRoles !== undefined) {
        const roleAllowed =
            Array.isArray(allowedRoles) &&
            Boolean(user?.role) &&
            allowedRoles.includes(user.role);

        if (!roleAllowed) {
            return (
                <Navigate
                    to="/dashboard"
                    replace
                    state={{ accessDenied: true }}
                />
            );
        }
    }

    return children;
}

export default ProtectedRoute;
