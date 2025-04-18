import { useLocation, useNavigate } from 'react-router-dom';
import { ArchiveButton, DownloadButton, ReturnButton } from '../components/part/common/Buttons';
import ElementList from '../components/part/ElementList';
import ElementFeature from '../components/part/ElementFeature';
import Draggable from '../components/wrapper/Draggable';
import usePage from '../hooks/usePage';
import useElementContext from '../hooks/useElementContext';
import useAPI from '../hooks/useAPI';


const TemplateDetail = () => {
    
    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { error, isPending, children, element } = usePage('templateDetail', location.state);
    const { dispatch: elementDispatch } = useElementContext();
    const apiCall = useAPI();

    // Updates for name, text, and wordWeight
    const updateTemplate = async (attr, val) => {
        console.log('Updating storynode:', attr, val);
        const newChildren = element.children.filter(child => child !== null); // Some cleanup
        const updatedTemplate = await apiCall('upsertElement', 'templates', { ...element, [attr]: val, children: newChildren });
        elementDispatch({ type: 'SET_ELEMENT', payload: updatedTemplate });
    };

    const handleDelete = async () => {
        await apiCall('deleteElement', 'templates', element._id);
        navigate('/templates');
    };

    return !isPending && (
        <>
            <div className='container content'>
                <div className='element detail'>
                    <div className='box-buttons'>
                        <button onClick={() => setShowModal(true)}>
                            <InlineSVG src='/trashcan.svg' alt='delete icon' className='icon' />
                        </button>
                    </div>
                    <ElementFeature element={element} onUpdate={updateTemplate} />
                    <div className='box'>
                        <MarkdownText text={element.text} update={(val) => updateTemplate('text', val)} />
                    </div>
                </div>
                <ElementList elements={children} kind='templates' listType='children' />
                {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
            </div>
        </>
    );
};

export default TemplateDetail;