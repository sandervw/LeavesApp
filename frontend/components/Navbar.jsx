import { Link } from 'react-router-dom';

const Navbar = () => {
    return ( 
        <nav className="navbar">
            <div className="site-header">
                <Link to='/'><h1>Leaves</h1></Link>
                <p>By Sander VanWilligen</p>
            </div>
            <ul className="links">
                <li><Link to='/'>Stories</Link></li>
                <li><Link to='/templates'>Templates</Link></li>
                <li><Link to='/archive'>Archive</Link></li>
            </ul>
        </nav>
     );
}
 
export default Navbar;