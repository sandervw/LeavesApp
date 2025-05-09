import { useState } from "react";
import useAPI from "../../hooks/useAPI";

const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const { error, isPending, apiCall } = useAPI();
    const [success, setSuccess] = useState(false);
    //const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await apiCall('forgotPassword', email);
        result && setSuccess(true);
    };

    return (
        <div className='modal-overlay'>
            {success
                ? <div className='modal-content'>Password reset email sent. Please check your inbox.</div>
                : <form className='modal-content' onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}>
                    <h2>Reset Password</h2>
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        autoComplete='email'
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button className='text-button clickable' type='submit'>Send Password Reset Email</button>
                    {error && <div className='error'>Error: {error}</div>}
                    {isPending && <div className='loading'>Loading...</div>}
                </form>}
        </div>
    );
};

export default ForgotPassword;