import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAddableContext from './useAddableContext';
import useAPI from './useAPI';

const usePage = (page) => {

    const [currentPage, setCurrentPage] = useState('');
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { children: elements, dispatch: ElementDispatch } = useElementContext();
    const { addables, dispatch: addablesDispatch } = useAddableContext();
    const apiCall = useAPI();

    useEffect(() => {
        console.log('UseEffect called in useTree');
        const fetchData = async () => {
            if (!page) return;
            setCurrentPage(page);
            setIsPending(true);
            const storynodes = page === 'stories' && (await apiCall('fetchElements', 'storynodes', 'type=root&archived=false') ?? []);
            const templates = page === 'stories' && (await apiCall('fetchElements', 'templates', `type=root`) ?? []);

            if (storynodes.error || templates.error) {
                setError(storynodes.error);
                setIsPending(false);
            } else {
                await ElementDispatch({ type: 'SET_CHILDREN', payload: storynodes });
                await ElementDispatch({ type: 'SET_ELEMENT', payload: null });
                await addablesDispatch({ type: 'SET_ADDABLES', payload: templates });
                setError(null);
                setIsPending(false);
            }
            setIsPending(false);
        };
        fetchData();
    }, [ElementDispatch, addablesDispatch, apiCall, page]);

    return { error, isPending, elements, addables, currentPage };

};

export default usePage;