import { Link } from 'react-router-dom';
import RubbishPile from '../part/RubbishPile';

const LinkSidebar = () => {

    return (
        <aside className='sidebar container'>
            <div className='site-links'>
                <ul className='links'>
                    <li><Link to='/' className='clickable'>Stories</Link></li>
                    <li><Link to='/templates' className='clickable'>Templates</Link></li>
                    <li><Link to='/archive' className='clickable'>Archive</Link></li>
                </ul>
            </div>
            <div className='rubbish-pile'>
                <RubbishPile />
            </div>
        </aside>
    );
    
};

export default LinkSidebar;