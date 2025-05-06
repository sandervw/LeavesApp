import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAddableContext from './useAddableContext';
import usePageContext from './usePageContext';
import apiService from '../services/apiService';

const usePage = (page, elementID) => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const { element, children, dispatch: ElementDispatch } = useElementContext();
    const { addables, dispatch: addablesDispatch } = useAddableContext();
    const { currentPage, dispatch: PageDispatch } = usePageContext();

    useEffect(() => {
        console.log('UseEffect called in usePage by page:', page);
        if (!page) return;
        const fetchData = async () => {
            setIsPending(true);
            try {
                await PageDispatch({ type: 'SET_PAGE', payload: page });
                let children, element, addables;
                if (page === 'stories') {
                    element = '';
                    children = await apiService.fetchElements('storynode', 'type=root&archived=false') ?? [];
                    addables = await apiService.fetchElements('template', `type=root`) ?? [];
                }
                if (page === 'templates') {
                    element = '';
                    children = await apiService.fetchElements('template', 'type=root') ?? [];
                    addables = [];
                }
                if (page === 'storynodeDetail') {
                    element = await apiService.fetchElement('storynode', elementID) ?? null;
                    children = await apiService.fetchChildren('storynode', elementID) ?? [];
                    addables = await apiService.fetchElements('template', `type=branch`) ?? [];
                }
                if (page === 'templateDetail') {
                    element = await apiService.fetchElement('template', elementID) ?? null;
                    children = await apiService.fetchChildren('template', elementID) ?? [];
                    addables = [];
                }
                await ElementDispatch({ type: 'SET_CHILDREN', payload: children });
                await ElementDispatch({ type: 'SET_ELEMENT', payload: element });
                await addablesDispatch({ type: 'SET_ADDABLES', payload: addables });
                setError(null);
                setIsPending(false);
            } catch (error) {
                setError(error);
                setIsPending(false);
            }
        };
        fetchData();
    }, [ElementDispatch, addablesDispatch, PageDispatch, page, elementID]);
    
    return { error, isPending, element, children, addables, currentPage };

};

export default usePage;