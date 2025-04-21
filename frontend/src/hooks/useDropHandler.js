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

    const checkError = (source, data, dropFunction) => {
        if (!data) throw new Error("No data provided");
        else if (droppableType === source)
            throw new Error("Cannot drop on itself");
        else if (droppableType === 'static')
            throw new Error("Cannot drop on static element");
        else if (droppableType === 'children' && source === 'detail')
            throw new Error("Cannot drop on children from detail element");
        else if (dropFunction === 'delete' && droppableType !== 'trash')
            throw new Error(`Cannot call delete from list type:, ${droppableType}`);
        else if (dropFunction === 'delete' && !['children', 'roots', 'detail'].includes(source))
            throw new Error(`Cannot delete element from:, ${source}`);
        else return;
    };

    const handleDelete = async (source, data) => {
        try {
            checkError(source, data, 'delete');
            console.log('Deleting element:', source, data.kind, data);
            await apiCall('deleteElement', data.kind, data._id);
            await elementDispatch({ type: 'DELETE_CHILD', payload: data._id });
            if (source === 'detail') {
                if (!element.parent) navigate('/');
                else navigate('/storydetail', { state: element.parent });
            }
        } catch (error) {
            console.error(error.message);
            return;
        }
    };

    const handleAdd = async (source, data) => {
        try {
            checkError(source, data, 'add');
            console.log('Adding element:', source, data);
            if (droppableType === 'static') return; //Prevent adding to static lists
            let newChild;
            if (droppableType === 'roots') {
                if (source === 'static') newChild = await apiCall('createFromTemplate', data._id, null);
                else newChild = await apiCall('upsertElement', data.kind, data);  // source = templateCreate or storynodeCreate
            }
            if (droppableType === 'children') {
                if (element.type === 'leaf') element.type = 'branch';
                await apiCall('upsertElement', data.kind, { ...element });
                if (source === 'static') newChild = await apiCall('createFromTemplate', data._id, element._id);
                else { // source = templateCreate or storynodeCreate
                    newChild = await apiCall('upsertElement', data.kind, data);
                    await apiCall('upsertElement', data.kind, { ...element, children: [...element.children, newChild._id] });
                }
                // Sync frontend
                elementDispatch({ type: 'SET_ELEMENT', payload: { ...element, children: [...element.children, newChild._id] } });
            }
            newChild && elementDispatch({ type: 'CREATE_CHILD', payload: newChild });
        } catch (error) {
            console.error(error.message);
            return;
        }
    };


    return { handleDelete, handleAdd };
};

export default useDropHandler;