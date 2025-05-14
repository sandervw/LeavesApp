import React from 'react';
import { useState } from 'react';
import DeleteConfirmation from '../overlay/DeleteConfirmation';
import Droppable from '../wrapper/Droppable';
import useDropHandler from '../../hooks/useDropHandler';
import InlineSVG from './common/InlineSVG';

/**
 * 
 * @returns {JSX.Element} A Droppable component where elements can be dragged for deletion.
 */
const RubbishPile = () => {
    const [showModal, setShowModal] = useState(false);
    const [deleteParams, setDeleteParams] = useState({ source: '', data: null });
    const { handleDelete } = useDropHandler('trash');

    // Make user confirm deletion if it is a detail or root element
    const checkConfirmation = (source, data) => {
        setDeleteParams({ source, data });
        if (source==='detail' || source==='roots') setShowModal(true);
        else handleDelete(source, data); // No confirmation needed for children
    }

    // handle delete on confirmation
    const confirmDelete = () => {
        handleDelete(deleteParams.source, deleteParams.data);
        setDeleteParams({ source: '', data: null }); // Reset deleteParams after deletion
        setShowModal(false);
    }

    return ( 
        <Droppable id='trash' className='trash' function={checkConfirmation}>
            <InlineSVG src='/trashcan.svg' alt='trashcan icon' className='icon' />
            <p>Drag and drop here to delete</p>
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={() => confirmDelete()} />}
        </Droppable>
        
     );
}
 
export default RubbishPile;