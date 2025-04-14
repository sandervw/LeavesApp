import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArchiveButton, DownloadButton, ReturnButton } from './part/common/Buttons';
import MarkdownText from './part/common/MarkdownText';
import AddSidebar from './layout/AddSidebar';
import LinkSidebar from './layout/LinkSidebar';
import ElementList from './part/ElementList';
import ElementFeature from './part/ElementFeature';
import Draggable from './wrapper/Draggable';
import useAPI from '../hooks/useAPI';
import useElementContext from '../hooks/useElementContext';

/**
 * TODO
 * - Add back locking feature for writing if word count is over limit
 * - Add back word count (sum of word counts of all children)
 */

const StorynodeDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { children, element, dispatch: elementDispatch } = useElementContext();
    const apiCall = useAPI();
    const [isPending, setIsPending] = useState(true);

    // Fetch the storynode, its children, and a list of templates that could be added
    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log('useEffect called');
            const storynode = await apiCall('fetchElement', 'storynodes', location.state);
            await elementDispatch({ type: 'SET_ELEMENT', payload: storynode });
            const children = await apiCall('fetchChildren', 'storynodes', location.state);
            await elementDispatch({ type: 'SET_CHILDREN', payload: children });
            storynode && setIsPending(false); //Only load page if a storynode was retrieved
        };
        fetchData();
    }, [location.state, elementDispatch, apiCall]);

    // Return to parent element
    const navigateParent = async () => {
        if (!element.parent) navigate('/');
        else navigate('/storydetail', { state: element.parent });
    };

    // Updates the name, text, or word count of the storynode
    const updateStorynode = async (attr, val) => {
        const newChildren = element.children.filter(child => child !== null); // Some cleanup
        apiCall('upsertElement', 'storynodes', { ...element, [attr]: val, children: newChildren });
        elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, [attr]: val, children: newChildren } });
        console.log(element);
    };

    const downloadStory = async () => {
        const data = await apiCall('createFile', element._id);
        console.log(data);
    };

    const toggleArchive = async () => {
        await apiCall('upsertElement', 'storynodes', { ...element, archived: !element.archived });
        navigate('/');
    };

    return !isPending && (
        <>
            <LinkSidebar />
            <div className='container content'>
                <Draggable
                    id={element._id}
                    source='detail'
                    data={element}
                    className='element detail'>
                    <div className='box-buttons'>
                        <ReturnButton onClick={navigateParent} />
                        <DownloadButton onClick={downloadStory} />
                        {element.type === 'root' && <ArchiveButton onClick={toggleArchive} />}
                    </div>
                    <ElementFeature element={element} onUpdate={updateStorynode} />
                    <div className='box'>
                        <MarkdownText
                            text={element.text}
                            update={(val) => updateStorynode('text', val)}
                            wordCount={(val) => updateStorynode('wordCount', val)} />
                    </div>
                </Draggable>
                <ElementList elements={children} kind='storynodes' listType='children' />
            </div>
            <AddSidebar page='storynodedetail' type='branch' />
        </>
    );
};

export default StorynodeDetail;