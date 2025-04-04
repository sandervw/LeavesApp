import { Link } from 'react-router-dom';
import { useState } from 'react';
import Signup from './Signup.jsx';


const Navbar = () => {

    const [showSignup, setShowSignup] = useState(false);

    return (
        <header className="navbar container">
            <div className="site-header">
                <Link to='/'><h1>Leaves</h1></Link>
            </div>
            <input type="search"
                name="search"
                autocomplete="off"
                placeholder="Search Stories and Templates"
                class="search" />
            <div className="site-login">
                <button className="text-button" onClick={() => setShowSignup(true)}>Log In</button>
                <button className="text-button" onClick={() => setShowSignup(true)}>Sign Up</button>
            </div>
            {showSignup && <Signup hideModal={() => setShowSignup(false)} />}
        </header>
    );
};

export default Navbar;