
import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";

const MAX_HEALTH_ATTEMPTS = 5;
const HEALTH_TIMEOUT = 20000;

const RETRY_DELAYS = [2000, 4000, 6000, 8000];

function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [connectionStatus, setConnectionStatus] = useState("checking");

    useEffect(() => {
        const apiBaseUrl = process.env.REACT_APP_API_URL;

        if (!apiBaseUrl) {
            console.warn("Backend API URL is not configured.");
            setConnectionStatus("unavailable");
            return;
        }

        let cancelled = false;
        let activeController = null;
        let retryTimer = null;

        const sleep = (delay) =>
            new Promise((resolve) => {
                retryTimer = setTimeout(resolve, delay);
            });

        const checkBackendHealth = async () => {
            let healthUrl;

            try {
                healthUrl = new URL(apiBaseUrl);

                healthUrl.pathname =
                    healthUrl.pathname
                        .replace(/\/api\/?$/, "")
                        .replace(/\/$/, "") + "/actuator/health";

                healthUrl.search = "";
                healthUrl.hash = "";
            } catch (error) {
                console.error("Invalid backend API URL:", error);

                if (!cancelled) {
                    setConnectionStatus("unavailable");
                }

                return;
            }

            for (
                let attempt = 0;
                attempt < MAX_HEALTH_ATTEMPTS;
                attempt++
            ) {
                if (cancelled) return;

                setConnectionStatus(
                    attempt === 0 ? "checking" : "waking"
                );

               const controller = new AbortController();
activeController = controller;

let timeoutTimer;

try {
    timeoutTimer = setTimeout(() => {
        controller.abort();
    }, HEALTH_TIMEOUT);

    const response = await fetch(
        healthUrl.toString(),
        {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
        }
    );

                    if (!response.ok) {
                        throw new Error(
                            `Health check returned HTTP ${response.status}`
                        );
                    }

                    const health = await response.json();

                    if (health?.status !== "UP") {
                        throw new Error("Backend is not healthy.");
                    }

                    if (!cancelled) {
                        setConnectionStatus("online");
                    }

                    return;

                } catch (error) {
                    if (cancelled) return;

                    console.warn(
                        `Backend health attempt ${attempt + 1} failed.`,
                        error
                    );

                } finally {
                    clearTimeout(timeoutTimer);
                    activeController = null;
                }

                if (attempt < MAX_HEALTH_ATTEMPTS - 1) {
                    await sleep(RETRY_DELAYS[attempt]);
                }
            }

            if (!cancelled) {
                setConnectionStatus("unavailable");
            }
        };

        checkBackendHealth();

        return () => {
            cancelled = true;

            activeController?.abort();

            if (retryTimer) {
                clearTimeout(retryTimer);
            }
        };
    }, []);

    const connectionMessages = {
        checking: "Connecting to NeuroWallet services...",
        waking: "Waking up secure backend services...",
        online: "Secure connection established",
        unavailable: "Services are taking longer than expected. You can still sign in.",
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password) {
            toast.error("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser(
                normalizedEmail,
                password
            );

            login(data);

            toast.success("Login successful.");

            const requestedPath = location.state?.from;

            const destination =
                requestedPath?.pathname?.startsWith("/") &&
                !requestedPath.pathname.startsWith("//") &&
                requestedPath.pathname !== "/"
                    ? {
                        pathname: requestedPath.pathname,
                        search: requestedPath.search || "",
                        hash: requestedPath.hash || "",
                    }
                    : { pathname: "/dashboard" };

            navigate(destination, { replace: true });

        } catch (error) {
            toast.error(
                error?.message || "Unable to sign in. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="login-form"
            onSubmit={handleSubmit}
            aria-label="Login form"
        >
            <div
                className={`login-connection-status ${connectionStatus}`}
                role="status"
                aria-live="polite"
            >
                <span
                    className="login-connection-dot"
                    aria-hidden="true"
                />

                <span>
                    {connectionMessages[connectionStatus]}
                </span>
            </div>

            <div className="form-group">
                <label
                    className="form-label"
                    htmlFor="login-email"
                >
                    Email Address
                </label>

                <div className="input-wrapper">
                    <MdEmail
                        className="input-icon"
                        aria-hidden="true"
                    />

                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        className="form-control input-with-icon"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck="false"
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label
                    className="form-label"
                    htmlFor="login-password"
                >
                    Password
                </label>

                <div className="password-wrapper">
                    <FaLock
                        className="input-icon"
                        aria-hidden="true"
                    />

                    <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                    />

                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() =>
                            setShowPassword((previous) => !previous)
                        }
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        disabled={loading}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
            </div>

            <div className="auth-options">
                <span className="login-access-label">
                    Secure account authentication
                </span>

                <Link
                    to="/forgot-password"
                    className="forgot-link"
                >
                    Forgot Password?
                </Link>
            </div>

            <button
                type="submit"
                className="login-btn"
                disabled={loading}
                aria-busy={loading}
            >
                {loading ? (
                    <>
                        <span
                            className="login-spinner"
                            aria-hidden="true"
                        />
                        Signing In...
                    </>
                ) : (
                    "Sign In to NeuroWallet"
                )}
            </button>

            <div className="auth-link">
                New to NeuroWallet?{" "}
                <Link to="/register">
                    Create Account
                </Link>
            </div>
        </form>
    );
}

export default LoginForm;
