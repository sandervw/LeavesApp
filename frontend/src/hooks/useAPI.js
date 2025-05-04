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
        if (!user) return;
        if (!apiMethods[method]) throw new Error(`Unknown API method: ${method}`);
        // TODO: refresh token if expired
        const result = await apiMethods[method](...args);
        if(result.error && result.error.name==='TokenExpiredError') dispatch({ type: 'LOGOUT' });
        if (result.error) {
            setError(result.error);
            setIsPending(false);
            return result;
        }
        setError(null);
        setIsPending(false);
        return result;
    }, [dispatch, user]);
    return { apiCall, error, isPending };
}

export default useAPI;