import { useState } from 'react';
import useAPI from '../../hooks/useAPI';

const ResetPasswordForm = ({ code }) => {
    const [password, setPassword] = useState('');
    const { error, isPending, apiCall } = useAPI();
    const [success, setSuccess] = useState(false);
    //const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await apiCall('resetPassword', {verificationCode: code, password});
        result && setSuccess(true);
    };
    return (
        <div>
            {success
                ? <div>Password updated successfully.</div>
                : <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}>
                    <h2>Reset Password</h2>
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        autoComplete='new-password'
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className='text-button clickable' type='submit'>Reset Password</button>
                    {error && <div className='error'>Error: {error}</div>}
                    {isPending && <div className='loading'>Loading...</div>}
                </form>}
        </div>
    );
};

export default ResetPasswordForm;