import Template from '../components/part/Template';
import Droppable from '../components/wrapper/Droppable';
import AddSidebar from '../components/layout/AddSidebar';
import LinkSidebar from '../components/layout/LinkSidebar';
import ElementList from '../components/part/ElementList';
import { useEffect } from 'react';
import useAPI from '../hooks/useAPI';
import useElementContext from '../hooks/useElementContext';

const Templates = () => {

    const { children: templates, dispatch } = useElementContext();
    const apiCall = useAPI();

    useEffect(() => {
        const fetchTemplates = async () => {
            const templates = await apiCall('fetchElements', 'templates', 'type=root');
            dispatch({ type: 'SET_CHILDREN', payload: templates });
            dispatch({ type: 'SET_ELEMENT', payload: null });
        };
        fetchTemplates();
    }, [dispatch, apiCall]);

    return (
        <>
            <LinkSidebar />
            <div className = 'content container'>
                <ElementList elements={templates} kind='templates' listType='roots' />
            </div>
            <AddSidebar page='templates' />
        </>
    );
};

export default Templates;