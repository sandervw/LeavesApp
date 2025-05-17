import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import RubbishPile from '../part/RubbishPile';
import useAuthContext from '../../hooks/useAuthContext';
import { ThemeToggle } from '../part/ThemeToggle';
import InlineSVG from '../part/common/InlineSVG';
import useTreelistContext from '../../hooks/useTreelistContext';

const LinkSidebar = () => {
    const { user } = useAuthContext();
    const [theme, setTheme] = useState('light');
    const [expand, setExpand] = useState('');
    const { trees } = useTreelistContext();

    const toggleExpand = (link) => {
        expand === link && setExpand('');
        expand !== link && setExpand(link);
    };

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        !user
            ? <div></div>
            : <aside className='sidebar container'>
                <div className='site-links'>
                    <ul className='links'>
                        <li>
                            <InlineSVG
                                src='/chevron.svg'
                                alt='expand icon'
                                className={expand === 'stories' ? 'icon expanded' : 'icon'}
                                onClick={() => toggleExpand('stories')} />
                            <Link to='/' className='clickable'>Stories</Link>
                            {expand === 'stories' && trees && trees.length > 0 && (
                                <ul className='links'>
                                    {trees.map((tree) => (
                                        <li key={tree._id}>
                                            <Link to='/storydetail' state={tree._id} className='clickable'>{tree.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                        <li>
                            <InlineSVG
                                src='/chevron.svg'
                                alt='expand icon'
                                className={expand === 'templates' ? 'icon expanded' : 'icon'}
                                onClick={() => toggleExpand('templates')} />
                            <Link to='/templates' className='clickable'>Templates</Link>
                        </li>
                        <li>
                            <InlineSVG
                                src='/chevron.svg'
                                alt='expand icon'
                                className={expand === 'archive' ? 'icon expanded' : 'icon'}
                                onClick={() => toggleExpand('archive')} />
                            <Link to='/archive' className='clickable'>Archive</Link>
                        </li>
                    </ul>
                </div>
                <ThemeToggle theme={theme} setTheme={setTheme} />
                <div className='rubbish-pile'>
                    <RubbishPile />
                </div>
            </aside>
    );

};

export default LinkSidebar;