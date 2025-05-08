import { useState } from 'react';
import useLogin from '../../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

const Login = ({ hideModal }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isPending } = useLogin();
    const Navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if(success){
            Navigate('/');
        }
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
                <button className='text-button clickable' type='submit'>Log In</button>
                <button className='text-button clickable' type='button' onClick={hideModal}>Cancel</button>
                <button className='text-button clickable'><a href='/password/forgot'>Forgot Password?</a></button>
                {error && <div className='error'>Error: {error}</div>}
                {isPending && <div className='loading'>Loading...</div>}
            </form>
        </div>
    );
};

export default Login;