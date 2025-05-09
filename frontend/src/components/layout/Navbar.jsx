import { Link, useNavigate } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';
import useElementContext from '../../hooks/useElementContext.js';
import useAddableContext from '../../hooks/useAddableContext.js';
import useAPI from '../../hooks/useAPI.js';
import Searchbar from '../part/Searchbar.jsx';


const Navbar = () => {

    const { user, dispatch: authDispatch } = useAuthContext();
    const { dispatch: addableDispatch } = useAddableContext();
    const { dispatch: elementDispatch } = useElementContext();
    const { apiCall } = useAPI();
    const Navigate = useNavigate();

    const handleLogout = () => {
        authDispatch({ type: 'LOGOUT' }); // dispatch logout action to context
        elementDispatch({ type: 'SET_CHILDREN', payload: null });
        addableDispatch({ type: 'SET_ADDABLES', payload: null });
        elementDispatch({ type: 'SET_ELEMENT', payload: null });
        localStorage.removeItem('user');
        apiCall('authLogout'); // call logout API (no need to await)
        Navigate('/landing');
    };

    return (
        user
            ? <header className='navbar container'>
                <div className='site-header'>
                    <Link to='/'><h1>Leaves</h1></Link>
                </div>
                <Searchbar />
                <div>
                    <span className='username'>Welcome, {user.username}</span>
                    <button className='text-button clickable' onClick={() => handleLogout()}>Log Out</button>
                </div>
            </header>
            : <header className='navbar container'>
                <div className='site-header'>
                    <Link to='/'><h1>Leaves</h1></Link>
                </div>
                <div>
                    <h2>Login or Signup to start</h2>
                </div>
                <div>
                    <button className='text-button clickable' onClick={() => Navigate('/login')}>Log In</button>
                    <button className='text-button clickable' onClick={() => Navigate('/signup')}>Sign Up</button>
                </div>
            </header>
    );
};

export default Navbar;