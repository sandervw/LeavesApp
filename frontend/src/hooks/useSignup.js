import { useState } from 'react';
import useAuthContext from '../hooks/useAuthContext';
import apiService from '../services/apiService';

const useSignup = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { dispatch } = useAuthContext();

    const signup = async (email, username, password) => {
        setIsPending(true);
        setError(null);
        try {
            const user = await apiService.authSignup({email, username, password});
            localStorage.setItem('user', JSON.stringify(user)); // save user to local storage
            dispatch({ type: 'LOGIN', payload: user });
            setError(null);
            setIsPending(false);
            return true;
        } catch (error) {
            setError(error);
            setIsPending(false);
            return false;
        }
    };

    return { signup, error, isPending };

};
export default useSignup;