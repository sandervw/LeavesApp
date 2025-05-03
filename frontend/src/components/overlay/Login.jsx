import { useState } from 'react';
import useLogin from '../../hooks/useLogin';

const Login = ({ hideModal }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isPending } = useLogin();


    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        success && hideModal();
    };

    return (
        <div className='modal-overlay'>
            <form className='modal-content' onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
            }}>
                <input
                    type='email'
                    placeholder='Username'
                    value={email}
                    autoComplete='username'
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type='password'
                    placeholder='Password'
                    value={password}
                    autoComplete='new-password'
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className='text-button' type='submit'>Log In</button>
                {error && <div className='error'>Error: {error}</div>}
                {isPending && <div className='loading'>Loading...</div>}
            </form>
        </div>
    );
};

export default Login;