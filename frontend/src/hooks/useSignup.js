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
        const response = await apiService.signupUser(email, username, password);
        const data = await response.json();

        if (!response.ok) {
            setError(data.error);
            setIsPending(false);
            return false;
        } else {
            localStorage.setItem('user', JSON.stringify(data)); // save user to local storage
            dispatch({ type: 'LOGIN', payload: data });
            setError(null);
            setIsPending(false);
            return true;
        }
    };

    return { signup, error, isPending };

};
export default useSignup;