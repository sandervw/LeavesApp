import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAddableContext from './useAddableContext';
import useAPI from './useAPI';

const usePage = (page, elementID) => {

    const [currentPage, setCurrentPage] = useState('');
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const { element, children, dispatch: ElementDispatch } = useElementContext();
    const { addables, dispatch: addablesDispatch } = useAddableContext();
    const apiCall = useAPI();

    useEffect(() => {
        console.log('UseEffect called in useTree by page:', page);
        if (!page) return;
        const fetchData = async () => {
            setCurrentPage(page);
            setIsPending(true);
            let children, element, addables;
            if (page === 'stories') {
                element = '';
                children = await apiCall('fetchElements', 'storynodes', 'type=root&archived=false') ?? [];
                addables = await apiCall('fetchElements', 'templates', `type=root`) ?? [];
            }
            if (page === 'templates') {
                element = '';
                children = await apiCall('fetchElements', 'templates', 'type=root') ?? [];
                addables = [];
            }
            if (page === 'storynodeDetail') {
                element = await apiCall('fetchElement', 'storynodes', elementID) ?? null;
                children = await apiCall('fetchChildren', 'storynodes', elementID) ?? [];
                addables = await apiCall('fetchElements', 'templates', `type=branch`) ?? [];
            }
            if (page === 'templateDetail') {
                element = await apiCall('fetchElement', 'templates', elementID) ?? null;
                children = await apiCall('fetchChildren', 'templates', elementID) ?? [];
                addables = [];
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
    console.log(`return page ${currentPage} after being called from page ${page}`);
    
    return { error, isPending, element, children, addables, currentPage };

};

export default usePage;