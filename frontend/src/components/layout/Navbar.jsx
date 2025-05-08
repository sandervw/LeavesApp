import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Signup from '../overlay/Signup';
import Login from '../overlay/Login';
import useLogout from '../../hooks/useLogout.js';
import useAuthContext from '../../hooks/useAuthContext.js';
import Searchbar from '../part/Searchbar.jsx';


const Navbar = () => {

    // const [showSignup, setShowSignup] = useState(false);
    // const [showLogin, setShowLogin] = useState(false);
    const { logout } = useLogout();
    const Navigate = useNavigate();
    const { user } = useAuthContext();

    const handleLogout = () => {
        logout();
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
                {/* {showSignup && <Signup hideModal={() => setShowSignup(false)} />}
                {showLogin && <Login hideModal={() => setShowLogin(false)} />} */}
            </header>
    );
};

export default Navbar;