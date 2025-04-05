import { Link } from 'react-router-dom';
import { useState } from 'react';
import Signup from './Signup';
import Login from './Login';
import useLogout from '../hooks/useLogout.js';


const Navbar = () => {

    const [showSignup, setShowSignup] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const { logout } = useLogout();

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
            <div>
                <button className="text-button" onClick={() => handleLogout()}>Log Out</button>
            </div>
            <div>
                <button className="text-button" onClick={() => setShowLogin(true)}>Log In</button>
                <button className="text-button" onClick={() => setShowSignup(true)}>Sign Up</button>
            </div>
            {showSignup && <Signup hideModal={() => setShowSignup(false)} />}
            {showLogin && <Login hideModal={() => setShowLogin(false)} />}
        </header>
    );
};

export default Navbar;