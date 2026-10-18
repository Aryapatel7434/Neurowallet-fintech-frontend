
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password) {
            toast.error("Please enter email and password");
            return;
        }

        if (loading) {
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser(
                normalizedEmail,
                password
            );

            // Persist authentication before navigating.
            login(data);

            toast.success("Login successful");

            // Return to the protected page when one was requested.
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
            // Do not log credentials, tokens, or raw auth responses.
            toast.error(
                error?.message || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                    Email
                </label>

                <div className="input-wrapper">
                    <MdEmail className="input-icon" />

                    <input
                        id="login-email"
                        type="email"
                        className="form-control input-with-icon"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                    Password
                </label>

                <div className="password-wrapper">
                    <FaLock className="input-icon" />

                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                    />

                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword((previous) => !previous)}
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
                <label className="remember-me">
                    <input
                        type="checkbox"
                        className="remember-checkbox"
                        disabled={loading}
                    />
                    <span>Remember Me</span>
                </label>

                <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                </Link>
            </div>

            <button
                type="submit"
                className="login-btn"
                disabled={loading}
            >
                {loading ? "Signing In..." : "Login"}
            </button>

            <div className="auth-link">
                New User? <Link to="/register">Create Account</Link>
            </div>
        </form>
    );
}

export default LoginForm;
