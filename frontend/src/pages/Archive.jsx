import AddSidebar from '../components/layout/AddSidebar';
import LinkSidebar from '../components/layout/LinkSidebar';
import ElementList from '../components/part/ElementList';
import { useEffect, useState } from 'react';
import useAPI from '../hooks/useAPI';
import useElementContext from '../hooks/useElementContext';

const Archive = () => {

    const [isPending, setIsPending] = useState(true);
    const { children: storynodes, dispatch } = useElementContext();
    const { apiCall } = useAPI();

    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            const nodes = await apiCall('fetchElements', 'storynode', 'type=root&archived=true');
            await dispatch({ type: 'SET_CHILDREN', payload: nodes });
            await dispatch({ type: 'SET_ELEMENT', payload: null });
            nodes && setIsPending(false); //Only load page if a storynode was retrieved
        };
        fetchData();
    }, [dispatch, apiCall]);

    return !isPending && (
        <>
            <LinkSidebar />
            <div className='content container'>
                <ElementList elements={storynodes} kind='storynode' listType='roots' />
            </div>
            <div>
                <span>TODO drop items here to unarchive?</span>
            </div>
        </>
    );
};

export default Archive;