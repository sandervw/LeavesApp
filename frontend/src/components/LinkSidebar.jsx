import { Link } from 'react-router-dom';

const LinkSidebar = () => {

    return (
        <aside className="sidebar container">
            <div className="site-links">
                <ul className="links">
                    <li><Link to='/'>Stories</Link></li>
                    <li><Link to='/templates'>Templates</Link></li>
                    <li><Link to='/archive'>Archive</Link></li>
                </ul>
            </div>
        </aside>
    );
};

export default LinkSidebar;