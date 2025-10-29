import { useEffect, useState } from 'react';
import RubbishPile from '../part/RubbishPile';
import useAuthContext from '../../hooks/useAuthContext';
import { ThemeToggle } from '../part/ThemeToggle';
import useTreelistContext from '../../hooks/useTreelistContext';
import ExpandList from '../part/ExpandList';

const LinkSidebar = () => {
    const { user } = useAuthContext();
    const [theme, setTheme] = useState('light');
    const { trees } = useTreelistContext();
    const safeTrees = trees || [];

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
                        <ExpandList
                            type="Stories"
                            items={safeTrees.filter((tree) => tree.kind === 'storynode' && !tree.archived)}
                        />
                        <ExpandList
                            type="Templates"
                            items={safeTrees.filter((tree) => tree.kind === 'template')}
                        />
                        <ExpandList
                            type="Archive"
                            items={safeTrees.filter((tree) => tree.archived)}
                        />
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