import AddSidebar from '../components/layout/AddSidebar';
import LinkSidebar from '../components/layout/LinkSidebar';
import ElementList from '../components/part/ElementList';
import { useEffect, useState } from 'react';
import useAPI from '../hooks/useAPI';
import useElementContext from '../hooks/useElementContext';

const Stories = () => {

    const [isPending, setIsPending] = useState(true);
    const { children: storynodes, dispatch } = useElementContext();
    const apiCall = useAPI();

    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            const nodes = await apiCall('fetchElements', 'storynodes', 'type=root&archived=false') ?? [];
            await dispatch({ type: 'SET_CHILDREN', payload: nodes });
            await dispatch({ type: 'SET_ELEMENT', payload: null });
            setIsPending(false); //Only load page if a storynode was retrieved
        };
        fetchData();
    }, [dispatch, apiCall]);

    return !isPending && (
        <>
            <LinkSidebar />
            <div className = 'content container'>
                <ElementList elements={storynodes} kind='storynodes' listType='roots' />
            </div>
            <AddSidebar page='stories' type='root' />
        </>
    );
};

export default Stories;