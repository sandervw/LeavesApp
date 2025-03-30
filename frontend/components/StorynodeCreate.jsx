import React, { useState } from 'react';
import { upsertElement } from '../services/apiService';
import MarkdownText from "./MarkdownText";
import useStorynodeContext from "../hooks/useStorynodesContext";


const StorynodeCreate = (props) => {
    const {dispatch} = useStorynodeContext();
    // All storynodes should have a parent, except for 'story' types
    let parent = props.parent;
    let parentId = parent ? parent._id : null;
    // When creating storynodes, there should always be a subtype
    const subType = props.subType;
    // If the subtype is a leaf, name it based on the parent
    const isLeaf = subType==='leaf';
    let leafName = '';
    if(isLeaf) {
        leafName = !parent.children
            ? `${parent.name} - Leaf 1`
            : `${parent.name} - Leaf ${parent.children.length+1}`
    }

    // Set the initial state, with the correct subtype
    const [newCreate, setNewCreate] = useState({name: "", text: ""});

    // Update the parent element with the new child
    const updateParent = async (id) => {
        if(!parent.children) parent.children = [];
        await parent.children.push(id);
        const data = await upsertElement('storynodes', parent);
        console.log(data);
        dispatch({type: 'SET_DETAILNODE', payload: data});
    };

    // On submission, need to handle two events: adding the new storynode, and possibly addings it ID to parent
    const handleSubmit = async (e) => {
        e.preventDefault();
        let newStorynode = {
            name: isLeaf ? leafName : newCreate.name,
            text: newCreate.text,
            type: subType,
            parent: parentId
        };
        // Add the new storynode
        const data = await upsertElement('storynodes', newStorynode);
        if(parent) updateParent(data._id);
        dispatch({type: 'CREATE_STORYNODE', payload: data})
        setNewCreate({name: "", text: ""});
    }

    return ( 
        <div className="element-create">
            <div>
                {!isLeaf && <input type="text"
                    placeholder={'New '+subType}
                    required
                    value={newCreate.name}
                    onChange={(e) => setNewCreate({...newCreate, name: e.target.value})}
                />}
                {isLeaf && <p>{leafName}</p>}
            </div>
            <div>
                <MarkdownText
                    key={newCreate.text}
                    text={newCreate.text}
                    update={(val) => setNewCreate({...newCreate, text: val})} />
            </div>
            <div>
                <button onClick={(e) => handleSubmit(e)}>
                    <img src="/save.svg" alt="save icon" />
                </button>
            </div>
        </div>
     );
}
 
export default StorynodeCreate;