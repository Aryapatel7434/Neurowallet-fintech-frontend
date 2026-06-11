import RegisterForm from "../../components/auth/RegisterForm";
import "../../styles/auth.css";

function RegisterPage() {
    return (
        <div className="auth-container">

            <div className="auth-card">

                <div className="brand-logo">

                    <div className="logo-circle">
                        N
                    </div>

                    <div className="logo-circle-secondary">
                        W
                    </div>

                </div>

                <h1 className="brand-title">
                    NeuroWallet
                </h1>

                <p className="brand-subtitle">
                    Secure Wallet • Smart Analytics • AI Insights
                </p>

                <h2 className="auth-title">
                    Create Account
                </h2>

                <RegisterForm />

                <div className="security-info">
                    JWT Secured • AI Powered • Enterprise Ready
                </div>

            </div>

        </div>
    );
}

export default RegisterPage;