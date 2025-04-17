import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAddableContext from './useAddableContext';
import useAPI from './useAPI';

const usePage = (page, elementID) => {

    const [currentPage, setCurrentPage] = useState('');
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { element, children, dispatch: ElementDispatch } = useElementContext();
    const { addables, dispatch: addablesDispatch } = useAddableContext();
    const apiCall = useAPI();

    useEffect(() => {
        console.log('UseEffect called in useTree');
        const fetchData = async () => {
            if (!page) return;
            setCurrentPage(page);
            setIsPending(true);
            let children, element, addables;
            if (page === 'stories') {
                children = await apiCall('fetchElements', 'storynodes', 'type=root&archived=false') ?? [];
                addables = await apiCall('fetchElements', 'templates', `type=root`) ?? [];
            }
            if (page === 'storynodeDetail') {
                element = await apiCall('fetchElement', 'storynodes', elementID) ?? null;
                children = await apiCall('fetchChildren', 'storynodes', elementID) ?? [];
                addables = await apiCall('fetchElements', 'templates', `type=branch`) ?? [];
            }

            if (children.error || addables.error || element.error) {
                setError(children.error || addables.error || element.error);
                setIsPending(false);
            } else {
                await ElementDispatch({ type: 'SET_CHILDREN', payload: children });
                await ElementDispatch({ type: 'SET_ELEMENT', payload: element });
                await addablesDispatch({ type: 'SET_ADDABLES', payload: addables });
                setError(null);
                setIsPending(false);
            }
            setIsPending(false);
        };
        fetchData();
    }, [ElementDispatch, addablesDispatch, apiCall, page, elementID]);

    return { error, isPending, element, children, addables, currentPage };

};

export default usePage;