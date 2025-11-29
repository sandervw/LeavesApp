import { useState } from "react";
import useAPI from "../../hooks/useAPI";

const ForgotPassword = () => {

  const [email, setEmail] = useState('');
  const { error, isPending, apiCall } = useAPI();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await apiCall('forgotPassword', email);
    result && setSuccess(true);
  };

  return (
    <>
      <div className='modal'>
        {success
          ? <p>Password reset email sent. Please check your inbox.</p>
          : <form className='display-flex-column gap-medium' onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}>
            <h2 className='text-center'>Reset Password</h2>
            <input
              className='input'
              type='email'
              placeholder='Email'
              value={email}
              autoComplete='email'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className='btn' type='submit'>Send Password Reset Email</button>
            {error && <div>Error: {error}</div>}
            {isPending && <div>Loading...</div>}
          </form>}
      </div>
      <div className='modal-backdrop'></div>
    </>
  );
};

export default ForgotPassword;