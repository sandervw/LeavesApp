import { useLocation, useNavigate } from 'react-router-dom';
import { ArchiveButton, DownloadButton, ReturnButton } from '../components/part/common/Buttons';
import MarkdownText from '../components/part/common/MarkdownText';
import ElementList from '../components/part/ElementList';
import ElementFeature from '../components/part/ElementFeature';
import Draggable from '../components/wrapper/Draggable';
import usePage from '../hooks/usePage';

const StorynodeDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { error, isPending, children, element } = usePage('storynodeDetail', location.state);

    // Return to parent element
    const navigateParent = async () => {
        if (!element.parent) navigate('/');
        else navigate('/storydetail', { state: element.parent });
    };

    // Updates the name, text, or word count of the storynode
    const updateStorynode = async (attr, val) => {
        console.log('Updating storynode:', attr, val);
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
        </>
    );
};

export default StorynodeDetail;