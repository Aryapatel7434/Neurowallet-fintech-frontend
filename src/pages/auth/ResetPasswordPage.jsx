import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import "../../styles/auth.css";

function ResetPasswordPage() {

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

                    Securely create your new password

                </p>

                <h2 className="auth-title">

                    Reset Password

                </h2>

                <ResetPasswordForm />

            </div>

        </div>

    );

}

export default ResetPasswordPage;