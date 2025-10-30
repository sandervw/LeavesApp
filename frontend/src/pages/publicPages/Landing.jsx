import { useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import usePage from '../../hooks/usePage';
import MarkdownText from '../../components/part/common/MarkdownText';

const landingContent = `
# Leaves - a writing tool

**Grow Templates** in a tree-like structure: a root, branches, *leaves*

Drag and drop a template to **Start Writing**

**Compose & Edit** directly within the tool

## Features

1. Reusable outline templates
2. Tree-based organization
3. Wordcount limits and tracking
4. Markdown editing
5. File downloads

## To Begin

Sign in or create an account.

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