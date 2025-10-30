import { useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import usePage from '../../hooks/usePage';

/**
 * Landing page for unauthenticated users
 * TODO: replace generic text below
 */
const Landing = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    usePage({ page: 'landing' });

    useEffect(() => {
        if (user) {
            navigate('/'); // Redirect to home if user is authenticated
        }
    }, [user, navigate]);

    return (
        <div className='landing-page'>
            <h1>What is Leaves?</h1>
            <p>Leaves is a writing tool.</p>
            <p>It allows you to create reusable templates.</p>
            <p>You build your templates in a treelike structure: a root, branches, leaves.</p>
            <p>When your template is ready, you drag and drop it to start a new piece of writing.</p>
            <p>You compose your writing within the tool.</p>
            <p>Leaves supports other features. Setting word limits. Markdown editing. Downloads.</p>
            <p>To begin, sign in or create an account.</p>
            <p>Good luck.</p>
        </div>
    );
};

export default Landing;