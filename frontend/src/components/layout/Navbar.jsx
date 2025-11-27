import { Link, useNavigate } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';
import useElementContext from '../../hooks/useElementContext.js';
import useAddableContext from '../../hooks/useAddableContext.js';
import useAPI from '../../hooks/useAPI.js';
import Searchbar from '../part/Searchbar.jsx';
import ThemeToggle from '../part/ThemeToggle';


const Navbar = () => {
  const { user, dispatch: authDispatch } = useAuthContext();
  const { dispatch: addableDispatch } = useAddableContext();
  const { dispatch: elementDispatch } = useElementContext();
  const { apiCall } = useAPI();
  const Navigate = useNavigate();

  const handleLogout = async () => {
    await authDispatch({ type: 'LOGOUT' }); // dispatch logout action to context
    elementDispatch({ type: 'SET_CHILDREN', payload: null });
    addableDispatch({ type: 'SET_ADDABLES', payload: null });
    elementDispatch({ type: 'SET_ELEMENT', payload: null });
    localStorage.removeItem('user');
    apiCall('authLogout'); // call logout API (no need to await)
  };

  return (
    user
      ? <nav className='navbar container'>
        <Link to='/'><h1 className='navbar-title'>Leaves</h1></Link>
        <div className="center-header">
          <Searchbar />
        </div>
        <div className="display-flex gap-medium">
          <span className='flex-child-center'>Welcome, {user.username}</span>
          <button className='btn' onClick={() => handleLogout()}>Log Out</button>
          <ThemeToggle />
        </div>
      </nav>
      : <nav className='navbar container'>
        <div>
          <Link to='/'><h1>Leaves</h1></Link>
        </div>
        <div className="center-header">
          <h2>Login or Signup to Begin</h2>
        </div>
        <div className="display-flex gap-medium">
          <button className='btn' onClick={() => Navigate('/login')}>Log In</button>
          <button className='btn' onClick={() => Navigate('/signup')}>Sign Up</button>
          <ThemeToggle />
        </div>
      </nav>
  );
};

export default Navbar;