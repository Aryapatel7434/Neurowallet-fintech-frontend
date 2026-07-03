import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { MdEmail } from "react-icons/md";

import { forgotPassword } from "../../services/authService";

function ForgotPasswordForm() {

    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!email) {

            toast.error("Please enter your email");

            return;

        }

        setLoading(true);

        try {

            const message = await forgotPassword(email);

            toast.success(message);

            toast.success("Reset Token Generated Successfully");

        } catch (error) {

            console.error(error);

            toast.error(

                error.response?.data ||

                "Unable to process request"

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

                    <MdEmail className="input-icon" />

                    <input

                        type="email"

                        className="form-control input-with-icon"

                        placeholder="Enter your registered email"

                        value={email}

                        onChange={(e) =>
                            setEmail(e.target.value)
                        }

                    />

                </div>

            </div>

            <button

                type="submit"

                className="auth-btn"

                disabled={loading}

            >

                {

                    loading

                        ? "Generating..."

                        : "Generate Reset Token"

                }

            </button>

            {

                resetToken && (

                    <div className="reset-token-box">

                        <h4>

                            Generated Reset Token

                        </h4>

                        <p>

                            {resetToken}

                        </p>

                    </div>

                )

            }

            <div className="auth-link">

                Remember your password?{" "}

                <Link to="/">

                    Login

                </Link>

            </div>

        </form>

    );

}

export default ForgotPasswordForm;