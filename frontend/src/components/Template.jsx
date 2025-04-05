import { useNavigate } from 'react-router-dom';
import {  upsertElement, deleteElement } from "../services/apiService";
import DeleteConfirmation from "./DeleteConfirmation";
import { useState } from "react";
import MarkdownText from "./MarkdownText";
import InlineSVG from "./InlineSVG";
import useTemplateContext from '../hooks/useTemplatesContext';

const Template = (props) => {

    const {dispatch} = useTemplateContext();
    const navigate = useNavigate();
    // Save, add, or remove button
    const buttonType = props.buttonType;
    // Parent function to add or remove a child
    const parentFunction = props.parentFunction;
    const [showModal, setShowModal] = useState(false);
    const templateData = {...props.templateData};
    
    // Go to detailed view of the element
    const handleDetail = () => {
        navigate('/templatedetail', {state: templateData._id});
    }

    // Updates the name, purposes, or children
    const updateTemplate = async (attr, val) => {
        await upsertElement('templates', {...templateData, text: val});
        dispatch({type: 'UPDATE_TEMPLATE', payload: {...templateData, text: val}});
    }

    // Delete the element
    const handleDelete = async () => {
        await deleteElement('templates', templateData._id);
        dispatch({type: 'DELETE_TEMPLATE', payload: templateData._id});
    }
    
    return ( 
        <div className="element" key={templateData._id}>
            <div onClick={(e) => handleDetail(e)}>
                <h4>{templateData.name}</h4>
            </div>
            <div>
                <MarkdownText text={templateData.text} update={(val) => updateTemplate('text', val)} />
            </div>
            <div>
                {buttonType==='delete' &&
                    <button onClick={(e) => {
                        e.stopPropagation();
                        setShowModal(true);
                        }}>
                        <InlineSVG src="/trashcan.svg" alt="delete icon" className="icon" />
                    </button>}
                {buttonType==='remove' &&
                    <button onClick={(e) => {
                        e.stopPropagation();
                        parentFunction('remove', templateData)}}>
                        <InlineSVG src="/remove.svg" alt="remove icon" className="icon" />
                    </button>}
                {buttonType==='add' &&
                    <button onClick={(e) => {
                        e.stopPropagation();
                        parentFunction('add', templateData)}}>
                        <InlineSVG src="/add.svg" alt="add icon" className="icon" />
                    </button>}
            </div>
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
        </div>
     );
}
 
export default Template;