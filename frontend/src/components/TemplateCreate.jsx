import React, { useState } from 'react';
import { upsertElement } from '../services/apiService';
import MarkdownText from "./MarkdownText";
import useAddableContext from '../hooks/useAddableContext';

//TODO NEED TO REFACTOR THIS WITH NEW CONTEXT HANDLING

const TemplateCreate = (props) => {
    const {dispatch} = useAddableContext();
    // Optional parent element to add a new child to
    let parent = props.parent;
    // Optional subType of the parent element
    const subType = props.subType;
    
    // Set the initial state, with the correct subtype
    const [newCreate, setNewCreate] = useState({name: '', type: subType, text: ''});

    // Update the parent element with the new child
    const updateParent = async (id) => {
        if(!parent.children) parent.children = [];
        parent.children.push(id);
        const data = await upsertElement('templates', parent);
        console.log(data);
        dispatch ({type: 'SET_NEWADDABLE', payload: data});
    };

    // On submission, need to handle two events: adding the new template, and possibly addings it ID to parent
    const handleSubmit = async (e) => {
        e.preventDefault();
        let newTemplate = {
            name: newCreate.name,
            text: newCreate.text,
            type: newCreate.type,
            parent: parent ? parent._id : null
        };
        // Add the new template
        const data = await upsertElement('templates', newTemplate);
        if(parent) updateParent(data._id);
        if(newCreate.type === subType) dispatch({type: 'CREATE_ADDABLE', payload: data}); // Only add to list if new template has same type as list elements
        setNewCreate({name: "", type: (subType ? subType : 'story'), text: ""});
    }

    return ( 
        <form className="child">
            <div className="nametype box">
                <input type="text"
                    placeholder='New Template'
                    required
                    value={newCreate.name}
                    onChange={(e) => setNewCreate({...newCreate, name: e.target.value})}
                />
                {(subType === 'story') && <select
                    value={newCreate.type}
                    onChange={(e) => setNewCreate({...newCreate, type: e.target.value})}
                    >
                    <option value='story'>Story</option>
                    <option value='act'>Act</option>
                    <option value='chapter'>Chapter</option>
                    <option value='scene'>Scene</option>
                    <option value='blob'>Blob</option>
                </select>}
            </div>
            <div className="text box">
                <MarkdownText
                    key={newCreate.text}
                    text={newCreate.text}
                    update={(val) => setNewCreate({...newCreate, text: val})} />
            </div>
            <div className="buttons box">
                <button className="button-save" onClick={(e) => handleSubmit(e)}>
                    <img src="/save.svg" alt="save icon" />
                </button>
            </div>
        </form>
     );
}
 
export default TemplateCreate;