import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAddableContext from './useAddableContext';
import usePageContext from './usePageContext';
import * as apiService from '../services/apiService';

/**
 * Hook to set story/template state (Detail and children elements), addable state, and current page state
 * @param {string} props.page the page name (e.g. 'stories', 'templates', 'storynodeDetail', 'templateDetail')
 * @param {string} props.elementID OPTIONAL: the element ID (e.g. storynode or template ID)
 * @returns {object} error, isPending, element, children, addables, currentPage
 */
const usePage = (props) => {

    const { page, elementID } = props ?? {};
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const { element, children, dispatch: elementDispatch } = useElementContext();
    const { addables, dispatch: addablesDispatch } = useAddableContext();
    const { currentPage, dispatch: pageDispatch } = usePageContext();

    useEffect(() => {
        if (!page) return;
        const fetchData = async () => {
            setIsPending(true);
            try {
                await pageDispatch({ type: 'SET_PAGE', payload: page });
                let fetchedChildren, fetchedElement, fetchedAddables;
                if (page === 'stories') {
                    fetchedElement = '';
                    fetchedChildren = await apiService.fetchElements('storynode', 'type=root&archived=false') ?? [];
                    fetchedAddables = await apiService.fetchElements('template', `type=root`) ?? [];
                }
                if (page === 'templates') {
                    fetchedElement = '';
                    fetchedChildren = await apiService.fetchElements('template', 'type=root') ?? [];
                    fetchedAddables = [];
                }
                if (page === 'archive') {
                    fetchedElement = '';
                    fetchedChildren = await apiService.fetchElements('storynode', 'type=root&archived=true') ?? [];
                    fetchedAddables = [];
                }
                if (page === 'storynodeDetail') {
                    fetchedElement = await apiService.fetchElement('storynode', elementID) ?? null;
                    fetchedChildren = await apiService.fetchChildren('storynode', elementID) ?? [];
                    fetchedAddables = await apiService.fetchElements('template', `type=branch`) ?? [];
                }
                if (page === 'templateDetail') {
                    fetchedElement = await apiService.fetchElement('template', elementID) ?? null;
                    fetchedChildren = await apiService.fetchChildren('template', elementID) ?? [];
                    fetchedAddables = [];
                }
                await elementDispatch({ type: 'SET_CHILDREN', payload: fetchedChildren });
                await elementDispatch({ type: 'SET_ELEMENT', payload: fetchedElement });
                await addablesDispatch({ type: 'SET_ADDABLES', payload: fetchedAddables });
                setError(null);
                setIsPending(false);
            } catch (error) {
                console.log('Error in usePage:', error);
                elementDispatch({ type: 'SET_ELEMENT', payload: null });
                elementDispatch({ type: 'SET_CHILDREN', payload: [] });
                addablesDispatch({ type: 'SET_ADDABLES', payload: [] });
                pageDispatch({ type: 'SET_PAGE', payload: null });
                setError(error);
                setIsPending(false);
            }
        };
        fetchData();
    }, [elementDispatch, addablesDispatch, pageDispatch, page, elementID]);
    
    return { error, isPending, element, children, addables, currentPage };

};

export default usePage;