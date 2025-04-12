import { Link } from 'react-router-dom';
import RubbishPile from '../part/RubbishPile';

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
            <div className="rubbish-pile">
                <RubbishPile />
            </div>
        </aside>
    );
};

export default LinkSidebar;