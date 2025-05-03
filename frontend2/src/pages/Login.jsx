const Login = () => {
    return (
        <div className="login-page">
            <h1>Sign into your account</h1>
            <form className="login-form">
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;