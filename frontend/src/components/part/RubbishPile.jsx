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
    const [deleteParams, setDeleteParams] = useState({ method: '', kind: '', data: null });

    const handleDelete= async () => {   
        if (deleteParams.method === 'deleteElement') {
            await apiCall(deleteParams.method, deleteParams.kind, deleteParams.data._id);
            dispatch({ type: 'DELETE_ELEMENT', payload: deleteParams.data._id });
            setShowModal(false);
            if (element.parent) navigate('/');
            else navigate('/storydetail', { state: element.parent });
        } else {
            console.error("Invalid method for delete operation:", deleteParams.method);
        }
    };

    const confirmDelete = (method, data) => {
        setDeleteParams({ method, kind: data.kind, data });
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