import { useState } from "react";



function LoginForm() {



    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");



    const handleSubmit = (e) => {

        e.preventDefault();



        console.log({

            email,

            password

        });

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

                    onChange={(e) => setEmail(e.target.value)}

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

                    onChange={(e) => setPassword(e.target.value)}

                />



            </div>



            <div className="auth-options">



                <label className="remember-me">

                    <input type="checkbox" />

                    <span>Remember Me</span>

                </label>



                <a href="/" className="forgot-link">

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