import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
    const {
        isAuthenticated,
        isInitializing,
        sessionRestoreError,
        retrySessionRestore,
    } = useContext(AuthContext);

    const location = useLocation();

    if (isInitializing) {
        return (
            <main
                className="auth-loading"
                role="status"
                aria-live="polite"
            >
                Restoring your secure session...
            </main>
        );
    }

    if (sessionRestoreError) {
        return (
            <main className="auth-loading">
                <p>
                    Unable to restore your session. Check your
                    connection and try again.
                </p>
                <button
                    type="button"
                    onClick={retrySessionRestore}
                >
                    Retry
                </button>
                <button
                    type="button"
                    onClick={() => {
                        localStorage.clear();
                        window.location.assign("/");
                    }}
                >
                    Return to login
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

    return children;
}

export default ProtectedRoute;
