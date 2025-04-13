import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmation from '../overlay/DeleteConfirmation';
import Droppable from '../wrapper/Droppable';
import useAPI from "../../hooks/useAPI";
import useElementContext from "../../hooks/useElementContext";

const RubbishPile = () => {    
    const { element, dispatch } = useElementContext();
    const navigate = useNavigate();
    const apiCall = useAPI();
    const [showModal, setShowModal] = useState(false);
    const [deleteParams, setDeleteParams] = useState({ source: '', kind: '', data: null });

    const handleDelete= async () => {
        console.log("Deleting element:", deleteParams.source, deleteParams.kind, deleteParams.data._id);
        if (deleteParams.source === 'children' || deleteParams.source === 'roots') {
            await apiCall('deleteElement', deleteParams.kind, deleteParams.data._id);
            dispatch({ type: 'DELETE_CHILD', payload: deleteParams.data._id });
            setShowModal(false);
            if(deleteParams.source === 'detail') {
                if (element.parent) navigate('/');
                else navigate('/storydetail', { state: element.parent });
            }
        } else {
            console.error("Cannot delete element from:", deleteParams.source);
            setShowModal(false);
        }
    };

    const confirmDelete = (source, data) => {
        setDeleteParams({ source, kind: `${data.kind}s`, data });
        setShowModal(true);
    }

    return ( 
        <Droppable id='RubbishPile' className="rubbish-box" function={confirmDelete}>
            <p>Drag and drop here to delete</p>
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
        </Droppable>
        
     );
}
 
export default RubbishPile;