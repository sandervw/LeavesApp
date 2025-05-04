import useAuthContext from '../hooks/useAuthContext';
import * as api from '../lib/api'
import { useCallback, useState } from 'react';
const useAPI = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { user, dispatch } = useAuthContext();

    const apiCall = useCallback(async (method, ...args) => {
        setIsPending(true);
        setError(null);
        const apiMethods = {...api}
        console.log('apiMethods', apiMethods);
        
        //if (!user) return;
        
        if (!apiMethods[method]) throw new Error(`Unknown API method: ${method}`);
        // TODO: refresh token if expired
        const result = await apiMethods[method]({...args});
        if(result.error && result.error.name==='TokenExpiredError') dispatch({ type: 'LOGOUT' });
        return result;

    }, [user, dispatch]);
    return { apiCall, error, isPending };
}

export default useAPI;