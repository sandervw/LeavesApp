import { Link } from 'react-router-dom';
import { useState } from 'react';
import Signup from './Signup.jsx';


const Navbar = () => {

    const [showSignup, setShowSignup] = useState(false);

    return (
        <header className="navbar">
            <div className="site-header">
                <Link to='/'><h1>Leaves</h1></Link>
            </div>
            <div className="site-links">
                <ul className="links">
                    <li><Link to='/'>Stories</Link></li>
                    <li><Link to='/templates'>Templates</Link></li>
                    <li><Link to='/archive'>Archive</Link></li>
                </ul>
            </div>
            <div className="site-login">
                <button className="text-button" onClick={() => setShowSignup(true)}>Log In</button>
                <button className="text-button" onClick={() => setShowSignup(true)}>Sign Up</button>
            </div>
            {showSignup && <Signup hideModal={() => setShowSignup(false)} />}
        </header>
    );
};

export default Navbar;