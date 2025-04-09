import { useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI';
import DeleteConfirmation from "../overlays/DeleteConfirmation";
import Draggable from "../wrappers/Draggable";
import { useState } from "react";
import MarkdownText from "../common/MarkdownText";
import InlineSVG from "../common/InlineSVG";
import useAddableContext from '../../hooks/useAddableContext';

const Template = (props) => {

    const {dispatch} = useAddableContext();
    const apiCall = useAPI();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const templateData = {...props.templateData};
    
    // Go to detailed view of the element
    const handleDetail = () => {
        navigate('/templatedetail', {state: templateData._id});
    }

    // Updates the name, purposes, or children
    const updateTemplate = async (attr, val) => {
        await apiCall('upsertElement', 'templates', {...templateData, [attr]: val});
        dispatch({type: 'UPDATE_ADDABLE', payload: {...templateData, [attr]: val}});
    }

    // Delete the element
    const handleDelete = async () => {
        await apiCall('deleteElement', 'templates', templateData._id);
        dispatch({type: 'DELETE_ADDABLE', payload: templateData._id});
    }
    
    return ( 
        
        <Draggable
            id={templateData._id}
            data={templateData._id}
            method="createFromTemplate">
            <div className="element" key={templateData._id}>
                <div onClick={(e) => handleDetail(e)}>
                    <h4>{templateData.name}</h4>
                </div>
                <div>
                    <MarkdownText text={templateData.text} update={(val) => updateTemplate('text', val)} />
                </div>
                {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
            </div>
        </Draggable>
     );
}
 
export default Template;