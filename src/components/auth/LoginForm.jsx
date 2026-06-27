import { toast } from "react-toastify";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";

function LoginForm() {

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [showPassword,
        setShowPassword] =
        useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!email || !password) {

            toast.error(
                "Please enter email and password"
            );

            return;
        }

        setLoading(true);

        try {

            const data =
                await loginUser(
                    email,
                    password
                );

            console.log(
                "Login Response:",
                data
            );
            console.log("EMAIL:", data.email);
            login(data);

            toast.success(
                "Login Successful"
            );

            navigate(
                "/dashboard"
            );

        } catch (error) {

            console.error(error);

            toast.error(
                "Login Failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <form onSubmit={handleSubmit}>

            <div className="form-group">

                <label className="form-label">
                    Email
                </label>

                <div className="input-wrapper">

                    <MdEmail
                        className="input-icon"
                    />

                    <input
                        type="email"
                        className="form-control input-with-icon"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div>

            <div className="form-group">

                <label className="form-label">
                    Password
                </label>

                <div className="password-wrapper">

                    <FaLock
                        className="input-icon"
                    />

                    <input
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        className="form-control"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                    />

                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() =>
                            setShowPassword(
                                !showPassword
                            )
                        }
                    >

                        {
                            showPassword
                                ? <FaEyeSlash />
                                : <FaEye />
                        }

                    </button>

                </div>

            </div>

            <div className="auth-options">

                <label className="remember-me">

                    <input
                        type="checkbox"
                        className="remember-checkbox"
                    />

                    <span>
                        Remember Me
                    </span>

                </label>

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
            >

                {
                    loading
                        ? "Signing In..."
                        : "Login"
                }

            </button>

            <div className="auth-link">

                New User?{" "}

                <Link to="/register">
                    Create Account
                </Link>

            </div>

        </form>

    );
}

export default LoginForm;