import { toast } from "react-toastify";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";

function LoginForm() {

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

           const data = await loginUser(
             email,
             password
        );

        console.log(
          "Login Response:",
          data
        );

        login(data);

        navigate("/dashboard");

        } catch (error) {

            console.error(error);

           toast.error("Login Failed");

        }
    };

    return (

        <form onSubmit={handleSubmit}>

            <div className="form-group">

                <label className="form-label">
                    Email
                </label>

                <input
                    type="email"
                    className="form-control"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

            </div>

            <div className="form-group">

                <label className="form-label">
                    Password
                </label>

                <input
                    type="password"
                    className="form-control"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

            </div>

            <div className="auth-options">

                <label className="remember-me">

                    <input type="checkbox" />

                    <span>Remember Me</span>

                </label>

                <a
                    href="/"
                    className="forgot-link"
                >
                    Forgot Password?
                </a>

            </div>

            <button
                type="submit"
                className="auth-btn"
            >
                Login
            </button>

            <div className="auth-link">

                New User?{" "}

                <a href="/register">
                    Create Account
                </a>

            </div>

        </form>
    );
}

export default LoginForm;