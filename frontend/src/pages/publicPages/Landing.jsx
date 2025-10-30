import { useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import usePage from '../../hooks/usePage';
import MarkdownText from '../../components/part/common/MarkdownText';

const landingContent = `# What is Leaves?

*Leaves* is a writing tool.

It allows you to create reusable templates.

You build your templates in a treelike structure: a root, branches, *leaves*.

When your template is ready, you drag and drop it to start a new piece of writing.

You compose your writing within the tool.

*Leaves* supports other features. Setting word limits. Markdown editing. Downloads.

To begin, sign in or create an account.

Good luck.`;

/**
 * Landing page for unauthenticated users
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
            <MarkdownText text={landingContent} />
        </div>
    );
};

export default Landing;