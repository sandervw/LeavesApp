import useElementContext from './useElementContext';
import useAPI from './useAPI';

const useDropHandler = (listType) => {
    const { element, dispatch: elementDispatch } = useElementContext();
    const apiCall = useAPI();

    const handleDelete = () => {
        //TODO: Implement delete functionality
    };

    const handleAdd = async (source, data) => {
        console.log('Adding element:', source, data);
        const kind = `${data.kind}s`
        if (listType === 'static') return; //Prevent adding to static lists
        let newChild;
        if (listType === 'roots') {
            if (source === 'static') newChild = await apiCall('createFromTemplate', data._id, null);
            else newChild = await apiCall('upsertElement', kind, data);  // source = templateCreate or storynodeCreate
        }
        if (listType === 'children') {
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