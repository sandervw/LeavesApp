import { useNavigate } from 'react-router-dom';
import { deleteElement, upsertElement } from "../services/apiService";
import DeleteConfirmation from "./DeleteConfirmation";
import { useState } from "react";
import MarkdownText from "./MarkdownText";
import useStorynodeContext from '../hooks/useStorynodesContext';

const Storynode = (props) => {

    const {dispatch} = useStorynodeContext();
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
        !(storynodeData.type==='leaf')
            ? navigate('/storydetail', {state: storynodeData._id})
            : navigate('/leafdetail', {state: storynodeData._id});
    }

     // Updates the text or content of a storynode
     const updateStorynode = async (attr, val) => {
        let updatedNode;
        if(attr === 'text') updatedNode = {...storynodeData, text: val}
        if(attr === 'content') updatedNode = {...storynodeData, content: val};
        if(attr === 'wordCount')updatedNode = {...storynodeData, wordCount: val};
        await upsertElement('storynodes', updatedNode);
        if(attr === 'wordCount') parentFunction('wordCount', val);
        dispatch({type: 'UPDATE_STORYNODE', payload: updatedNode});
    }

    // Delete the element
    const handleDelete = async () => {
        await deleteElement('storynodes', storynodeData._id);
        dispatch({type: 'DELETE_STORYNODE', payload: storynodeData._id});
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
                        <img src="/trashcan.svg" alt="delete icon" />
                    </button>}
                {buttonType==='remove' &&
                    <button onClick={(e) => {
                        e.stopPropagation();
                        parentFunction('remove', storynodeData._id)}}>
                        <img src="/remove.svg" alt="remove icon" />
                    </button>}
                {buttonType==='add' &&
                    <button onClick={(e) => {
                        e.stopPropagation();
                        parentFunction('add', storynodeData._id)}}>
                        <img src="add.svg" alt="add icon" />
                    </button>}
            </div>
            {showModal && <DeleteConfirmation hideModal={() => setShowModal(false)} confirmModal={handleDelete} />}
        </div>
    );
};

export default Storynode;