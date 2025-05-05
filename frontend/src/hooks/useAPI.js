import useAuthContext from '../hooks/useAuthContext';
import apiService from '../services/apiService';
import { useCallback, useState } from 'react';
const useAPI = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { user, dispatch } = useAuthContext();

    const apiCall = useCallback(async (method, ...args) => {
        setIsPending(true);
        setError(null);
        const apiMethods = {...apiService}
        if (!user) {
            const data = await apiService.getUser();
            localStorage.setItem('user', JSON.stringify(data.user));
            dispatch({ type: 'LOGIN', payload: data.user });
        }
        if (!apiMethods[method]) throw new Error(`Unknown API method: ${method}`);
        try {
            const result = await apiMethods[method](...args);
            setError(null);
            setIsPending(false);
            return result;
        } catch (error) {
            setError(error);
            setIsPending(false);
            return;
        }
    }, [dispatch, user]);
    return { apiCall, error, isPending };
}

export default useAPI;