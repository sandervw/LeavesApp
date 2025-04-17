import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InlineSVG from '../components/part/common/InlineSVG';
import DeleteConfirmation from '../components/overlay/DeleteConfirmation';
import MarkdownText from '../components/part/common/MarkdownText';
import AddSidebar from '../components/layout/AddSidebar';
import LinkSidebar from '../components/layout/LinkSidebar';
import ElementFeature from '../components/part/ElementFeature';
import ElementList from '../components/part/ElementList';
import useAPI from '../hooks/useAPI';
import useElementContext from '../hooks/useElementContext';


const TemplateDetail = () => {
    const location = useLocation(); // Grab the element from location state
    const navigate = useNavigate();
    const { children, element, dispatch } = useElementContext();
    const apiCall = useAPI();
    const [showModal, setShowModal] = useState(false);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsPending(true);
            console.log('useEffect called');
            const template = await apiCall('fetchElement', 'templates', location.state);
            await dispatch({ type: 'SET_ELEMENT', payload: template });
            const children = await apiCall('fetchChildren', 'templates', location.state);
            await dispatch({ type: 'SET_CHILDREN', payload: children });
            template && setIsPending(false); //Only load page if a storynode was retrieved
        };
        fetchData();
    }, [location.state, dispatch, apiCall]);

    // Updates for name, text, and wordWeight
    const updateTemplate = async (attr, val) => {
        const updatedTemplate = await apiCall('upsertElement', 'templates', { ...element, [attr]: val });
        dispatch({ type: 'SET_ELEMENT', payload: updatedTemplate });
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