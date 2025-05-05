import useAuthContext from '../hooks/useAuthContext';
import apiService from '../services/apiService';
import { useCallback, useState } from 'react';
const useAPI = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { user, dispatch } = useAuthContext();

    const tryRefreshToken = async () => {
        const { status, data } = await apiService.authRefresh();
        if (!status || status !== 'OK') {
            setError(data.error);
            setIsPending(false);
            return 'failed';
        }
        return 'success';
    }

    const apiCall = useCallback(async (method, ...args) => {
        setIsPending(true);
        setError(null);
        const apiMethods = {...apiService}
        // if (!user) {
        //     const data = await apiService.getUser();
        //     // TODO: error handling
        //     localStorage.setItem('user', JSON.stringify(data.user)); // save user to local storage
        //     dispatch({ type: 'LOGIN', payload: data.user });
        // }
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