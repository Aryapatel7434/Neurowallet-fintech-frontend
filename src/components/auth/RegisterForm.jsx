 import { useState } from "react";



function RegisterForm() {



    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");



    const handleSubmit = (e) => {

        e.preventDefault();



        console.log({

            name,

            email,

            password

        });

    };



    return (

        <form onSubmit={handleSubmit}>



            <div className="form-group">



                <label className="form-label">

                    Full Name

                </label>



                <input

                    type="text"

                    className="form-control"

                    placeholder="Enter Full Name"

                    value={name}

                    onChange={(e) => setName(e.target.value)}

                />



            </div>



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

                    placeholder="Create Password"

                    value={password}

                    onChange={(e) => setPassword(e.target.value)}

                />



            </div>



            <button

                type="submit"

                className="auth-btn"

            >

                Create Account

            </button>



            <div className="auth-link">



                Already have an account?{" "}



                <a href="/">

                    Login

                </a>



            </div>



        </form>

    );

}



export default RegisterForm;