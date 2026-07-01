import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
    FaUser,
    FaLock,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import { MdEmail } from "react-icons/md";

import { registerUser } from "../../services/userService";

function RegisterForm() {

    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!name || !email || !password) {

            toast.error("Please fill all fields");

            return;
        }

        if (password.length < 6) {

            toast.error("Password must be at least 6 characters");

            return;
        }

        setLoading(true);

        try {

            await registerUser({

                name,

                email,

                password

            });

            toast.success("Account created successfully!");

            navigate("/");

        } catch (error) {

            console.error(error);

            const message =
                error.response?.data?.message ||
                error.response?.data ||
                "Registration failed";

            toast.error(message);

        } finally {

            setLoading(false);

        }

    };

    return (

        <form onSubmit={handleSubmit}>

            {/* Name */}

            <div className="form-group">

                <label className="form-label">

                    Full Name

                </label>

                <div className="input-wrapper">

                    <FaUser className="input-icon" />

                    <input
                        type="text"
                        className="form-control input-with-icon"
                        placeholder="Enter Full Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                </div>

            </div>

            {/* Email */}

            <div className="form-group">

                <label className="form-label">

                    Email

                </label>

                <div className="input-wrapper">

                    <MdEmail className="input-icon" />

                    <input
                        type="email"
                        className="form-control input-with-icon"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                </div>

            </div>

            {/* Password */}

            <div className="form-group">

                <label className="form-label">

                    Password

                </label>

                <div className="password-wrapper">

                    <FaLock className="input-icon" />

                    <input
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        className="form-control"
                        placeholder="Create Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() =>
                            setShowPassword(!showPassword)
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

            {/* Submit */}

            <button
                type="submit"
                className="auth-btn"
                disabled={loading}
            >

                {
                    loading
                        ? "Creating Account..."
                        : "Create Account"
                }

            </button>

            {/* Login Link */}

            <div className="auth-link">

                Already have an account?{" "}

                <Link to="/">

                    Login

                </Link>

            </div>

        </form>

    );

}

export default RegisterForm;