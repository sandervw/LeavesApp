import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI';
import useAuthContext from '../../hooks/useAuthContext';

const Signup = ({ hideModal }) => {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { error, isPending, apiCall } = useAPI();
    const { dispatch } = useAuthContext();
    const Navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = await apiCall('authSignup', { email, username, password });
        if(user){
            localStorage.setItem('user', JSON.stringify(user)); // save user to local storage
            dispatch({ type: 'LOGIN', payload: user });
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
                    placeholder='Email'
                    value={email}
                    autoComplete='email'
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type='text'
                    placeholder='Username'
                    value={username}
                    autoComplete='username'
                    onChange={(e) => setUsername(e.target.value)}
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
                <button className='text-button' type='submit'>Sign Up</button>
                <button className='text-button clickable' type='button' onClick={hideModal}>Cancel</button>
                {error && <div className='error'>Error: {error}</div>}
                {isPending && <div className='loading'>Loading...</div>}
            </form>
        </div>
    );
};

export default Signup;