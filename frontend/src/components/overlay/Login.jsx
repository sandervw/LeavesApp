import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI';
import useAuthContext from '../../hooks/useAuthContext';

const Login = ({ hideModal }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, isPending, apiCall } = useAPI();
  const { dispatch } = useAuthContext();
  const Navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await apiCall('authLogin', { email, password });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user)); // save user to local storage
      dispatch({ type: 'LOGIN', payload: user });
      Navigate('/');
    }
  };

  return (
    <>
      <div className='modal'>
        <form className='display-flex-column gap-medium' onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}>
          <input
            className='input font-medium'
            type='email'
            placeholder='Username'
            value={email}
            autoComplete='username'
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className='input font-medium'
            type='password'
            placeholder='Password'
            value={password}
            autoComplete='new-password'
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className='btn' type='submit'>Log In</button>
          <button className='btn' type='button' onClick={hideModal}>Cancel</button>
          <button className='btn'><a href='/password/forgot'>Forgot Password?</a></button>
          {error && <div>Error: {error}</div>}
          {isPending && <div>Loading...</div>}
        </form>
      </div>
      <div className='modal-backdrop' onClick={hideModal}></div>
    </>
  );
};

export default Login;