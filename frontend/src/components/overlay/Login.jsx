import { useState } from "react";
import useLogin from "../../hooks/useLogin";

const Login = ({ hideModal }) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isPending } = useLogin();


    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        success && hideModal();
    };

    return (
        <div className="modal-overlay">
            <form className="modal-content" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
            }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    autoComplete="username"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className="text-button" type="submit">Log In</button>
                {error && <div className="error">Error: {error}</div>}
                {isPending && <div className="loading">Loading...</div>}
            </form>
        </div>
    );
};

export default Login;