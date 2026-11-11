import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MdEmail } from "react-icons/md";

import { forgotPassword } from "../../services/authService";

function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            toast.error("Please enter your email address.");
            return;
        }

        setLoading(true);
        setSubmitted(false);

        try {
            const response = await forgotPassword(normalizedEmail);

            const message =
                typeof response === "string"
                    ? response
                    : response?.message ||
                      "If an account exists for this email, a password reset link will be sent.";

            setSubmitted(true);
            toast.success(message);
        } catch (error) {
            console.error("Forgot password request failed:", {
                status: error?.status,
                code: error?.code,
                message: error?.message,
            });

            toast.error(
                error?.message ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                    Email
                </label>

                <div className="input-wrapper">
                    <MdEmail
                        className="input-icon"
                        aria-hidden="true"
                    />

                    <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        className="form-control input-with-icon"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setSubmitted(false);
                        }}
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck="false"
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <button
                type="submit"
                className="auth-btn"
                disabled={loading}
                aria-busy={loading}
            >
                {loading ? "Sending reset link..." : "Send Password Reset Link"}
            </button>

            {submitted && (
                <p className="reset-success-message" role="status">
                    If your email is registered, please check your inbox
                    (including the spam folder) for the password reset link.
                </p>
            )}

            <div className="auth-link">
                Remember your password?{" "}
                <Link to="/">Login</Link>
            </div>
        </form>
    );
}

export default ForgotPasswordForm;