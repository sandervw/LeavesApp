import { useLocation } from 'react-router-dom';
import ElementList from '../components/part/ElementList';
import ElementFeature from '../components/part/ElementFeature';
import Draggable from '../components/wrapper/Draggable';
import usePage from '../hooks/usePage';
import useElementContext from '../hooks/useElementContext';
import useAPI from '../hooks/useAPI';


const TemplateDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const { error, isPending, children, element } = usePage('templateDetail', location.state);
    const { dispatch: elementDispatch } = useElementContext();
    const apiCall = useAPI();

    // Updates for name, text, and wordWeight
    const updateTemplate = async (attr, val) => {
        console.log('Updating storynode:', attr, val);
        const newChildren = element.children.filter(child => child !== null); // Some cleanup
        const updatedTemplate = await apiCall('upsertElement', element.kind, { ...element, [attr]: val, children: newChildren });
        elementDispatch({ type: 'SET_ELEMENT', payload: updatedTemplate });
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
                    <ElementFeature element={element} onUpdate={updateTemplate} />
                </Draggable>
                <ElementList elements={children} kind='template' listType='children' />
            </div>}
    </>;
};

export default TemplateDetail;