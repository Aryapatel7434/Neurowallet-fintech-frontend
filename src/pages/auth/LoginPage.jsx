
import LoginForm from "../../components/auth/LoginForm";
import "../../styles/auth.css";

function LoginPage() {
    return (
        <main className="auth-container login-page">
            <section
                className="auth-card login-card"
                aria-labelledby="login-heading"
            >
                <header className="login-brand">
                    <div
                        className="brand-logo"
                        aria-label="NeuroWallet logo"
                    >
                        <span className="logo-circle">N</span>
                        <span className="logo-circle-secondary">W</span>
                    </div>

                    <h1 className="brand-title">
                        NeuroWallet
                    </h1>

                    <p className="brand-subtitle">
                        AI-Powered Financial Platform
                    </p>
                </header>

                <div className="login-heading">
                    <p className="login-eyebrow">
                        SECURE ACCOUNT ACCESS
                    </p>

                    <h2
                        id="login-heading"
                        className="auth-title"
                    >
                        Welcome Back
                    </h2>

                    <p className="login-description">
                        Sign in to manage your wallet, track transactions,
                        and explore your financial insights.
                    </p>
                </div>

                <LoginForm />

                <footer className="login-security-footer">
                    <span className="login-security-indicator" />
                    <span>
                        Secure access to your NeuroWallet account
                    </span>
                </footer>
            </section>
        </main>
    );
}

export default LoginPage;
