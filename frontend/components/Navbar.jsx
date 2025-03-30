import { Link } from 'react-router-dom';
import LoginButton from './LoginButton.jsx';
import LogoutButton from './LogoutButton.jsx';

const Navbar = () => {

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
                <LoginButton />
                <LogoutButton />
            </div>
        </header>
    );
};

export default Navbar;