import { useState } from 'react';
import useAuthContext from './useAuthContext';
import apiService from '../services/apiService';

const useLogin = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { dispatch } = useAuthContext();

    const login = async (email, password) => {
        // Note: username can be an email or username
        try {
            const user = await apiService.authLogin({email, password});
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

    return { login, error, isPending };

};
export default useLogin;