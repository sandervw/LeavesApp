import { useNavigate } from 'react-router-dom';
import apiService from "../services/apiService";
import DeleteConfirmation from "./DeleteConfirmation";
import { useState } from "react";
import MarkdownText from "./MarkdownText";
import InlineSVG from "./InlineSVG";
import useElementContext from '../hooks/useElementContext';

const Storynode = (props) => {

    const {dispatch} = useElementContext();
    const navigate = useNavigate();
    // Save, add, or remove button
    const buttonType = props.buttonType;
    // Parent function to add or remove a child
    const parentFunction = props.parentFunction;
    const [showModal, setShowModal] = useState(false);
    const storynodeData = {...props.storynodeData};
    const locked = props.locked;

    // Go to detailed view of the element
    const handleDetail = () => {
        navigate('/storydetail', {state: storynodeData._id})
    }

     // Updates the text or content of a storynode
     const updateStorynode = async (attr, val) => {
        let updatedNode;
        if(attr === 'text') updatedNode = {...storynodeData, text: val}
        if(attr === 'content') updatedNode = {...storynodeData, content: val};
        if(attr === 'wordCount')updatedNode = {...storynodeData, wordCount: val};
        await apiService.upsertElement('storynodes', updatedNode);
        if(attr === 'wordCount') parentFunction('wordCount', val);
        dispatch({type: 'UPDATE_CHILD', payload: updatedNode});
    }

    // Delete the element
    const handleDelete = async () => {
        await apiService.deleteElement('storynodes', storynodeData._id);
        dispatch({type: 'DELETE_CHILD', payload: storynodeData._id});
        //setShowModal(false);
    }

    return (
        <div className="element" key={storynodeData._id}>
            <div  onClick={(e) => handleDetail(e)}>
                <h4>{storynodeData.name}</h4>
            </div>
            <div>
                <MarkdownText text={storynodeData.text} update={(val) => updateStorynode('text', val)} />
                {storynodeData.type==='leaf' &&
                    <div className="leafContent">
                        <MarkdownText
                            text={storynodeData.content}
                            update={(val) => updateStorynode('content', val)}
                            wordCount={(val) => updateStorynode('wordCount', val)}
                            locked={locked} />
                    </div>}
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
                        parentFunction('remove', storynodeData._id)}}>
                        <InlineSVG src="/remove.svg" alt="remove icon" className="icon" />
                    </button>}
                {buttonType==='add' &&
                    <button onClick={(e) => {
                        e.stopPropagation();
                        parentFunction('add', storynodeData._id)}}>
                        <InlineSVG src="/add.svg" alt="add icon" className="icon" />
                    </button>}
            </div>
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
        </div>
    );
};

export default Storynode;