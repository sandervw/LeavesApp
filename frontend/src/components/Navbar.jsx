import { Link } from 'react-router-dom';
import { useState } from 'react';
import Signup from './Signup';
import Login from './Login';
import useLogout from '../hooks/useLogout.js';
import useAuthContext from '../hooks/useAuthContext.js';


const Navbar = () => {

    const [showSignup, setShowSignup] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const { logout } = useLogout();
    const { user } = useAuthContext();

    const handleLogout = () => {
        logout();
    }

    return (
        <header className="navbar container">
            <div className="site-header">
                <Link to='/'><h1>Leaves</h1></Link>
            </div>
            <input type="search"
                name="search"
                autoComplete="off"
                placeholder="Search Stories and Templates"
                className="search" />
            {user && <div>
                <span className="username">Welcome, {user.username}</span>
                <button className="text-button" onClick={() => handleLogout()}>Log Out</button>
            </div>}
            {!user && <div>
                <button className="text-button" onClick={() => setShowLogin(true)}>Log In</button>
                <button className="text-button" onClick={() => setShowSignup(true)}>Sign Up</button>
            </div>}
            {showSignup && <Signup hideModal={() => setShowSignup(false)} />}
            {showLogin && <Login hideModal={() => setShowLogin(false)} />}
        </header>
    );
};

export default Navbar;