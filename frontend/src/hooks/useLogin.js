import { useState } from 'react';
import useAuthContext from './useAuthContext';
//import apiService from '../services/apiService';
import apiService from '../services/apiService';

const useLogin = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { dispatch } = useAuthContext();

    const login = async (email, password) => {
        // Note: username can be an email or username
        const { status, data } = await apiService.authLogin({email, password});
        if (!status || status !== 'OK') {
            setError(data.error);
            setIsPending(false);
            return false;
        } else {
            localStorage.setItem('user', JSON.stringify(data.user)); // save user to local storage
            dispatch({ type: 'LOGIN', payload: data.user });
            setError(null);
            setIsPending(false);
            return true;
        }
    };

    return { login, error, isPending };

};
export default useLogin;