import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthContext from '../../hooks/useAuthContext.js';
import useElementContext from '../../hooks/useElementContext.js';
import useAddableContext from '../../hooks/useAddableContext.js';
import useAPI from '../../hooks/useAPI.js';
import Searchbar from '../part/Searchbar.jsx';
import { ThemeToggle } from '../part/ThemeToggle';


const Navbar = () => {
    const [theme, setTheme] = useState('light');
    const { user, dispatch: authDispatch } = useAuthContext();
    const { dispatch: addableDispatch } = useAddableContext();
    const { dispatch: elementDispatch } = useElementContext();
    const { apiCall } = useAPI();
    const Navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

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
            ? <header className='navbar container'>
                <div>
                    <Link to='/'><h1>Leaves</h1></Link>
                </div>
                <div className="center-header">
                <Searchbar />
                </div>
                <div>
                    <span className='username'>Welcome, {user.username}</span>
                    <button className='text-button clickable' onClick={() => handleLogout()}>Log Out</button>
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
            </header>
            : <header className='navbar container'>
                <div>
                    <Link to='/'><h1>Leaves</h1></Link>
                </div>
                <div className="center-header">
                    <h2>Login or Signup to Begin</h2>
                </div>
                <div>
                    <button className='text-button clickable' onClick={() => Navigate('/login')}>Log In</button>
                    <button className='text-button clickable' onClick={() => Navigate('/signup')}>Sign Up</button>
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
            </header>
    );
};

export default Navbar;