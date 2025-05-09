import { useState, useEffect } from 'react';
import useElementContext from './useElementContext';
import useAddableContext from './useAddableContext';
import useAuthContext from './useAuthContext';
import usePageContext from './usePageContext';
import apiService from '../services/apiService';

const usePage = (props) => {

    const { page, elementID } = props ?? {};
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const { element, children, dispatch: elementDispatch } = useElementContext();
    const { addables, dispatch: addablesDispatch } = useAddableContext();
    const { currentPage, dispatch: pageDispatch } = usePageContext();
    const { user, dispatch: userDispatch } = useAuthContext();

    useEffect(() => {
        console.log('UseEffect called in usePage by page:', page);
        if (!page) return;
        const fetchData = async () => {
            setIsPending(true);
            try {
                await pageDispatch({ type: 'SET_PAGE', payload: page });
                console.log(user);
                if (!user) { // attempt to retrieve user for local data
                    const userData = await apiService.getUser();
                    if (userData) {
                        localStorage.setItem('user', JSON.stringify(user)); // save user to local storage
                        userDispatch({ type: 'LOGIN', payload: user });
                    }
                }
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
                await elementDispatch({ type: 'SET_CHILDREN', payload: children });
                await elementDispatch({ type: 'SET_ELEMENT', payload: element });
                await addablesDispatch({ type: 'SET_ADDABLES', payload: addables });
                setError(null);
                setIsPending(false);
            } catch (error) {
                setError(error);
                setIsPending(false);
            }
        };
        fetchData();
    }, [userDispatch, elementDispatch, addablesDispatch, pageDispatch, page, elementID, user]);
    
    return { error, isPending, element, children, addables, currentPage, user };

};

export default usePage;