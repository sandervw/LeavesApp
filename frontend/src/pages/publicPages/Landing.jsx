import { useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import usePage from '../../hooks/usePage';

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
            <h1>Welcome to Leaves</h1>
            <p>Your journey into the world of storytelling begins here.</p>
            <p>Explore, create, and share your stories with ease.</p>
        </div>
    );
};

export default Landing;