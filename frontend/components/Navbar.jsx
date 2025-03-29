import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton.jsx';
import LogoutButton from './LogoutButton.jsx';

const Navbar = () => {
    const { isAuthenticated, user } = useAuth0();

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
                {!isAuthenticated ? (<LoginButton />)
                : (
                    <>
                        <h1>Welcome, {user.name}</h1>
                        <img src={user.picture} alt="Profile" style={{ borderRadius: '50%' }} />
                        <LogoutButton />
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;