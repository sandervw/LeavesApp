import useAuthContext from '../hooks/useAuthContext';
import apiService from '../services/apiService';
import { useCallback } from 'react';
const useAPI = () => {
    const { user, dispatch } = useAuthContext();

    const apiCall = useCallback(async (method, ...args) => {
        const serviceMethods = {...apiService}
        if (!user) return;
        const options = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        };
        if (!serviceMethods[method]) throw new Error(`Unknown API method: ${method}`);
        const result = await serviceMethods[method](...args, options);
        if(result.error && result.error.name==='TokenExpiredError') dispatch({ type: 'LOGOUT' });
        return result;

    }, [user, dispatch]);
    return apiCall;
}

export default useAPI;