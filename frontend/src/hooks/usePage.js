import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAPI from './useAPI';

const useTree = (page) => {
    
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { children: storynodes, dispatch: ElementDispatch } = useElementContext();
    const apiCall = useAPI();

    useEffect(() => {
        console.log('UseEffect called in useTree');
        
        const fetchData = async () => {
            setIsPending(true);
            const data = page==='stories' && (await apiCall('fetchElements', 'storynodes', 'type=root&archived=false') ?? []);
            if (data.error) {
                setError(data.error);
                setIsPending(false);
            } else {
                await ElementDispatch({ type: 'SET_CHILDREN', payload: data });
                await ElementDispatch({ type: 'SET_ELEMENT', payload: null });
                setError(null);
                setIsPending(false);
            }
            setIsPending(false);
        };
        fetchData();
    }, [ElementDispatch, apiCall, page]);
    
    return { error, isPending, storynodes };

}

export default useTree;