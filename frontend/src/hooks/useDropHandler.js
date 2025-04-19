import useElementContext from './useElementContext';
import useAPI from './useAPI';
import { useNavigate } from 'react-router-dom';

/**
 * Used by droppable components to handle when an item is dropped onto them.
 * Add/Delete methods require a source (list), and the data (element) being dropped.
 * 
 * @param {string} droppableType - 'Roots', 'children', 'static', or 'trash'.
 * @returns {object} - An object containing the handleDelete and handleAdd functions.
 */
const useDropHandler = (droppableType) => {
    const { element, dispatch: elementDispatch } = useElementContext();
    const apiCall = useAPI();
    const navigate = useNavigate();

    const handleDelete = async (source, data) => {
        if (droppableType !== 'trash') console.error('Cannot call delete from list type:', droppableType);
        else if (['children', 'roots', 'detail'].includes(source)) {
            console.log('Deleting element:', source, data.kind, data);
            const kind = `${data.kind}s`
            await apiCall('deleteElement', kind, data._id);
            await elementDispatch({ type: 'DELETE_CHILD', payload: data._id });
            if(source === 'detail') {
                if (!element.parent) navigate('/');
                else navigate('/storydetail', { state: element.parent });
            }
        }
        else console.error('Cannot delete element from:', source);
    };

    const handleAdd = async (source, data) => {
        console.log('Adding element:', source, data);
        const kind = `${data.kind}s`
        if (droppableType === 'static') return; //Prevent adding to static lists
        let newChild;
        if (droppableType === 'roots') {
            if (source === 'static') newChild = await apiCall('createFromTemplate', data._id, null);
            else newChild = await apiCall('upsertElement', kind, data);  // source = templateCreate or storynodeCreate
        }
        if (droppableType === 'children') {
            if (element.type === 'leaf') element.type = 'branch';
            await apiCall('upsertElement', kind, { ...element });
            if (source === 'static') newChild = await apiCall('createFromTemplate', data._id, element._id);
            else { // source = templateCreate or storynodeCreate
                newChild = await apiCall('upsertElement', kind, data);
                await apiCall('upsertElement', kind, { ...element, children: [...element.children, newChild._id] });
            }
            // Sync frontend
            elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, children: [...element.children, newChild._id] } });
        }
        newChild && elementDispatch({ type: 'CREATE_CHILD', payload: newChild });
    };


    return { handleDelete, handleAdd };
};

export default useDropHandler;