import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import "../../styles/auth.css";

function ForgotPasswordPage() {

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
                    Recover your account securely
                </p>

                <h2 className="auth-title">
                    Forgot Password
                </h2>

                <ForgotPasswordForm />

            </div>

        </div>

    );

}

export default ForgotPasswordPage;