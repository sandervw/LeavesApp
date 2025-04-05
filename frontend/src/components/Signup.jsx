import { useState } from "react";
import useSignup from "../hooks/useSignup";

const Signup = ({ hideModal }) => {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { signup, error, isPending } = useSignup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await signup(email, username, password);
        success && hideModal();
    };

    return (
        <div className="modal-overlay">
            <form className="modal-content" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
            }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
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
                <button className="text-button" type="submit">Sign Up</button>
                {error && <div className="error">Error: {error}</div>}
                {isPending && <div className="loading">Loading...</div>}
            </form>
        </div>
    );
};

export default Signup;