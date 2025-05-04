import { useLocation, useNavigate } from 'react-router-dom';
import { ArchiveButton, DownloadButton, ReturnButton } from '../components/part/common/Buttons';
import ElementList from '../components/part/ElementList';
import ElementFeature from '../components/part/ElementFeature';
import Draggable from '../components/wrapper/Draggable';
import usePage from '../hooks/usePage';
import useElementContext from '../hooks/useElementContext';
import useAPI from '../hooks/useAPI';

const StorynodeDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { error, isPending, children, element } = usePage('storynodeDetail', location.state);
    const { dispatch: elementDispatch } = useElementContext();
    const { apiCall } = useAPI();

    // Updates the name, text, or word count of the storynode
    const updateStorynode = async (attr, val) => {
        const updatedStorynode = await apiCall('upsertElement', element.kind, { ...element, [attr]: val });
        elementDispatch({ type: 'SET_ELEMENT', payload: updatedStorynode });
    };

    const navigateParent = async () => {
        if (!element.parent) navigate('/');
        else navigate('/storydetail', { state: element.parent });
    };

    const downloadStory = async () => {
        const data = await apiCall('createFile', element._id);
        console.log(data);
    };

    const toggleArchive = async () => {
        await apiCall('upsertElement', 'storynode', { ...element, archived: !element.archived });
        navigate('/');
    };

    return <>
        {error && <div className='error container'>{error}</div>}
        {isPending && <div className='loading container'>Loading...</div>}
        {!isPending && !error &&
            <div className='content container'>
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
                </Draggable>
                <ElementList elements={children} kind='storynode' listType='children' />
            </div>}
    </>
};

export default StorynodeDetail;