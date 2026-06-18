import LoginForm from "../../components/auth/LoginForm";
import "../../styles/auth.css";

function LoginPage() {


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
                AI Powered Financial Platform
            </p>

            <h2 className="auth-title">
                Welcome Back
            </h2>

            <LoginForm />

        </div>

    </div>

);


}

export default LoginPage;
