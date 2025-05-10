import { useState, useEffect } from 'react';
import useAuthContext from './useAuthContext';
import apiService from '../services/apiService';

/**
 * TODO: Maybe delete this hook, as it is not used anywhere in the app.
 */
const useAuth = () => {
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const { dispatch } = useAuthContext();

    useEffect(() => {
        console.log('UseEffect called in useAuth');
        const fetchData = async () => {
            setIsPending(true);
            try {
                const userData = await apiService.getUser();
                localStorage.setItem('user', JSON.stringify(userData)); // save user to local storage
                await dispatch({ type: 'LOGIN', payload: userData });
                setError(null);
                setIsPending(false);
            } catch (error) {
                apiService.authLogout();
                localStorage.removeItem('user'); // remove user from local storage
                dispatch({ type: 'LOGOUT' });
                setError(error);
                setIsPending(false);
            }
        };
        fetchData();
    }, [dispatch]);
    
    return { error, isPending };

};

export default useAuth;