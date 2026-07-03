import { useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";
import { toast } from "react-toastify";

import {
    FaLock,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import { resetPassword } from "../../services/authService";

function ResetPasswordForm() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const [token, setToken] = useState(
        searchParams.get("token") || ""
    );

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!token || !newPassword || !confirmPassword) {

            toast.error("Please fill all fields");

            return;

        }

        if (newPassword.length < 6) {

            toast.error(
                "Password must be at least 6 characters"
            );

            return;

        }

        if (newPassword !== confirmPassword) {

            toast.error("Passwords do not match");

            return;

        }

        setLoading(true);

        try {

            const message = await resetPassword(

                token,

                newPassword

            );

            toast.success(message);

            setTimeout(() => {

                navigate("/");

            }, 1500);

        } catch (error) {

            console.error(error);

            toast.error(

                error.response?.data ||

                "Unable to reset password"

            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <form onSubmit={handleSubmit}>

            {/* Reset Token */}

            <div className="form-group">

                <label className="form-label">

                    Reset Token

                </label>

                <input

                    type="text"

                    className="form-control"

                    placeholder="Paste your reset token"

                    value={token}

                    onChange={(e) =>
                        setToken(e.target.value)
                    }

                />

            </div>

            {/* New Password */}

            <div className="form-group">

                <label className="form-label">

                    New Password

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

                        placeholder="Enter new password"

                        value={newPassword}

                        onChange={(e) =>
                            setNewPassword(
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

            {/* Confirm Password */}

            <div className="form-group">

                <label className="form-label">

                    Confirm Password

                </label>

                <input

                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }

                    className="form-control"

                    placeholder="Confirm your password"

                    value={confirmPassword}

                    onChange={(e) =>
                        setConfirmPassword(
                            e.target.value
                        )
                    }

                />

            </div>

            {/* Submit */}

            <button

                type="submit"

                className="auth-btn"

                disabled={loading}

            >

                {

                    loading

                        ? "Updating Password..."

                        : "Reset Password"

                }

            </button>

            {/* Back */}

            <div className="auth-link">

                <Link to="/">

                    Back to Login

                </Link>

            </div>

        </form>

    );

}

export default ResetPasswordForm;