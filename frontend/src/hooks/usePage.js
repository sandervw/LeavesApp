import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAddableContext from './useAddableContext';
import usePageContext from './usePageContext';
import useAPI from './useAPI';

const usePage = (page, elementID) => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const { element, children, dispatch: ElementDispatch } = useElementContext();
    const { addables, dispatch: addablesDispatch } = useAddableContext();
    const { currentPage, dispatch: PageDispatch } = usePageContext();


    const apiCall = useAPI();

    useEffect(() => {
        console.log('UseEffect called in useTree by page:', page);
        if (!page) return;
        const fetchData = async () => {
            setIsPending(true);
            await PageDispatch({ type: 'SET_PAGE', payload: page });
            let children, element, addables;
            if (page === 'stories') {
                element = '';
                children = await apiCall('fetchElements', 'storynode', 'type=root&archived=false') ?? [];
                addables = await apiCall('fetchElements', 'template', `type=root`) ?? [];
            }
            if (page === 'templates') {
                element = '';
                children = await apiCall('fetchElements', 'template', 'type=root') ?? [];
                addables = [];
            }
            if (page === 'storynodeDetail') {
                element = await apiCall('fetchElement', 'storynode', elementID) ?? null;
                children = await apiCall('fetchChildren', 'storynode', elementID) ?? [];
                addables = await apiCall('fetchElements', 'template', `type=branch`) ?? [];
            }
            if (page === 'templateDetail') {
                element = await apiCall('fetchElement', 'template', elementID) ?? null;
                children = await apiCall('fetchChildren', 'template', elementID) ?? [];
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
    }, [ElementDispatch, addablesDispatch, PageDispatch, apiCall, page, elementID]);
    
    return { error, isPending, element, children, addables, currentPage };

};

export default usePage;