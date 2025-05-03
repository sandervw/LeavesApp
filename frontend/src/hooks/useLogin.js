import { useState } from 'react';
import useAuthContext from './useAuthContext';
import apiService from '../services/apiService';

const useLogin = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { dispatch } = useAuthContext();

    const login = async (email, password) => {
        setIsPending(true);
        setError(null);
        // Note: username can be an email or username
        const response = await apiService.loginUser(email, password);
        const data = await response.json();
        if (!response.ok) {
            setError(data.error);
            setIsPending(false);
            return false;
        } else {
            dispatch({ type: 'LOGIN', payload: data });
            setError(null);
            setIsPending(false);
            return true;
        }
    };

    return { login, error, isPending };

};
export default useLogin;