import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmation from '../overlay/DeleteConfirmation';
import Droppable from '../wrapper/Droppable';
import useAPI from '../../hooks/useAPI';
import useElementContext from '../../hooks/useElementContext';

/**
 * 
 * @returns {JSX.Element} A Droppable component where elements can be dragged for deletion.
 */
const RubbishPile = () => {    
    const { element, dispatch } = useElementContext();
    const navigate = useNavigate();
    const apiCall = useAPI();
    const [showModal, setShowModal] = useState(false);
    const [deleteParams, setDeleteParams] = useState({ source: '', kind: '', data: null });

    const handleDelete = async (confirmArgs) => {
        console.log('Deleting element:', confirmArgs);
        // If no args are passed in, use the deleteParams stored in state
        const { source, kind, data } = confirmArgs || deleteParams;
        console.log('Deleting element:', source, kind, data);
        if (['children', 'roots', 'detail'].includes(source)) {
            await apiCall('deleteElement', kind, data._id);
            await dispatch({ type: 'DELETE_CHILD', payload: data._id });
            setShowModal(false);
            if(source === 'detail') {
                if (element.parent) navigate('/');
                else navigate('/storydetail', { state: element.parent });
            }
        } else {
            console.error('Cannot delete element from:', source);
            setShowModal(false);
        }
        setDeleteParams({ source: '', kind: '', data: null }); // Reset deleteParams after deletion
    };

    // Make user confirm deletion if it is a detail or root element
    const confirmDelete = (source, data) => {
        setDeleteParams({ source, kind: `${data.kind}s`, data });
        if (source==='detail' || source==='roots') setShowModal(true);
        else handleDelete({source, kind: `${data.kind}s`, data}); // No confirmation needed for children
    }

    return ( 
        <Droppable id='trash' className='rubbish-box' function={confirmDelete}>
            <p>Drag and drop here to delete</p>
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={() => handleDelete()} />}
        </Droppable>
        
     );
}
 
export default RubbishPile;