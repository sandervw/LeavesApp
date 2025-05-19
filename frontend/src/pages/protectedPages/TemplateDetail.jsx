import { useLocation } from 'react-router-dom';
import ElementList from '../../components/part/ElementList';
import ElementFeature from '../../components/part/ElementFeature';
import Draggable from '../../components/wrapper/Draggable';
import usePage from '../../hooks/usePage';
import useElementContext from '../../hooks/useElementContext';
import useAPI from '../../hooks/useAPI';

/**
 * Page to display a single template in detail
 * Renders the template (an ElementFeature component) and its children (ElementList)
 * Uses the usePage hook to fetch the template and its children
 */
const TemplateDetail = () => {

    const location = useLocation(); // Grab the element from location state
    const { error, isPending, children, element } = usePage({ page: 'templateDetail', elementID: location.state });
    const { dispatch: elementDispatch } = useElementContext();
    const { apiCall } = useAPI();

    // Updates for name, text, and wordWeight
    const updateTemplate = async (attr, val) => {
        if (attr === 'wordWeight') val = parseInt(val);
        const updatedTemplate = await apiCall('upsertElement', element.kind, { ...element, [attr]: val });
        elementDispatch({ type: 'SET_ELEMENT', payload: updatedTemplate });
    };

    return error
        ? <div className='error container'>{error}</div>
        : isPending
            ? <div className='loading container'>Loading...</div>
            : <div className='content container'>
                <Draggable
                    id={element._id}
                    source='detail'
                    data={element}
                    className='element detail'>
                    <ElementFeature element={element} onUpdate={updateTemplate} />
                </Draggable>
                <ElementList elements={children} kind='template' listType='children' />
            </div>
};

export default TemplateDetail;