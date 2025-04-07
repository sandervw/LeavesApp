import React, { useState } from 'react';
import apiService from '../services/apiService';
import MarkdownText from "./MarkdownText";
import InlineSVG from "./InlineSVG";
import Draggable from './Draggable';
import useElementContext from "../hooks/useElementContext";

const StorynodeCreate = () => {
    const { element, dispatch } = useElementContext();
    // All storynodes should have a parent, except for 'story' types
    const subType = element ? 'leaf' : 'root';
    // Set the initial state, with default name
    const [newCreate, setNewCreate] = useState({ name: "", text: "" });

    // Update the parent element with the new child
    const updateParent = async (id) => {
        let parent = { ...element };
        if (!parent.children) parent.children = [];
        if (parent.type === 'leaf') parent.type = 'branch'; // If the parent is a leaf, change it to a branch
        await parent.children.push(id);
        const data = await apiService.upsertElement('storynodes', parent);
        console.log(data);
        dispatch({ type: 'SET_ELEMENT', payload: data });
    };

    // On submission, need to handle two events: adding the new storynode, and possibly addings it ID to parent
    const handleSubmit = async () => {
        let newStorynode = {
            name: newCreate.name ? newCreate.name : 'New ' + subType,
            text: newCreate.text ? newCreate.text : 'Placeholder text',
            type: subType,
            parent: element ? element._id : null,
        };
        // Add the new storynode
        const data = await apiService.upsertElement('storynodes', newStorynode);
        if (element) await updateParent(data._id);
        dispatch({ type: 'CREATE_CHILD', payload: data });
        setNewCreate({ name: "", text: "" });
    };

    return (
        <Draggable id="newcreate" function={() => handleSubmit()}>
            <div className="element">
                <div  onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <input
                        placeholder={'New ' + subType}
                        required
                        value={newCreate.name}
                        onChange={(e) => setNewCreate({ ...newCreate, name: e.target.value })}
                    />
                </div>
                <div  onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <MarkdownText
                        key={newCreate.text}
                        text={newCreate.text}
                        update={(val) => setNewCreate({ ...newCreate, text: val })} />
                </div>
            </div>
        </Draggable>
    );
};

export default StorynodeCreate;