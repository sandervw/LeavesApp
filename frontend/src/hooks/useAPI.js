import * as apiService from '../services/apiService';
import { useCallback, useState } from 'react';
const useAPI = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);

    const apiCall = useCallback(async (method, ...args) => {
        setIsPending(true);
        setError(null);
        const apiMethods = {...apiService};
        if (!apiMethods[method]) throw new Error(`Unknown API method: ${method}`);
        try {
            const result = await apiMethods[method](...args);
            setError(null);
            setIsPending(false);
            return result;
        } catch (error) {
            console.error('Error in useAPI:', error);
            setError(error);
            setIsPending(false);
            return;
        }
    }, []);
    return { apiCall, error, isPending };
}

export default useAPI;