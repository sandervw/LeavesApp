import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from 'react';
import useAPI from '../../hooks/useAPI';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const exp = Number(searchParams.get('exp'));
  const now = Date.now();
  const linkIsValid = code && exp && (now < exp); // Check if the link is valid (code and expiration time are present and not expired)
  const [password, setPassword] = useState('');
  const { error, isPending, apiCall } = useAPI();
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await apiCall('resetPassword', { verificationCode: code, password });
    result && setSuccess(true);
    // Wait 3 seconds, then navigate to login page
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  return (
    <>
      <div className='modal'>
        {linkIsValid
          ? (success
            ? <div className='display-flex-column gap-medium'>Password updated. Redirecting...</div>
            : <form className='display-flex-column gap-medium' onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}>
              <h2>Reset Password</h2>
              <input
                className='input font-medium'
                type='password'
                placeholder='New Password'
                value={password}
                autoComplete='new-password'
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className='btn' type='submit'>Reset Password</button>
              {error && <div>Error: {error}</div>}
              {isPending && <div>Loading...</div>}
            </form>)
          : <div className='display-flex-column gap-medium'>
            <h2>Invalid or expired link</h2>
            <button className='btn'><a href='/password/forgot'>Send New Reset Email</a></button>
          </div>}
      </div>
      <div className='modal-backdrop'></div>
    </>
  );
};

export default ResetPassword;