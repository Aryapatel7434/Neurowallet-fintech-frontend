
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";

function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

            // Store the authenticated session through AuthContext.
            login(data);

            toast.success("Login successful.");

            // Restore the protected route requested before login.
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
